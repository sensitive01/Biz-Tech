const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');

// Auth middleware for tenant isolation
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

router.get('/', auth, async (req, res) => {
  try {
    let query = { tenantId: req.user.id };
    if (req.user.role === 'employee' && req.user.employeeId) {
      query.employeeId = req.user.employeeId;
    } else if (req.user.role === 'branch' && req.user.branchId) {
      const branchEmployees = await Employee.find({ tenantId: req.user.id, branchId: req.user.branchId }).select('_id');
      query.employeeId = { $in: branchEmployees.map(e => e._id) };
    } else if (req.user.role === 'business' && req.user.businessName) {
      const bizEmployees = await Employee.find({ tenantId: req.user.id, businessName: req.user.businessName }).select('_id');
      query.employeeId = { $in: bizEmployees.map(e => e._id) };
    }
    const leaves = await Leave.find(query).populate('employeeId').sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const isEmployee = req.user.role === 'employee';
    const isSoleOperator = Number(req.user.businessType) === 1;

    let targetEmployeeId = req.body.employeeId;
    if (isEmployee) {
      if (!req.user.employeeId) {
        return res.status(400).json({ error: 'Employee account is not linked to an employee profile' });
      }
      targetEmployeeId = req.user.employeeId;
    }

    if (!targetEmployeeId) {
      return res.status(400).json({ error: 'Employee is required' });
    }

    const category = req.body.category === 'Permission' ? 'Permission' : 'Leave';
    const startDate = req.body.startDate || new Date();
    const endDate = category === 'Permission' ? (req.body.endDate || startDate) : (req.body.endDate || startDate);

    // Approval status workflow:
    // Type 1: Single operator (1 Owner) -> Direct record, automatically Approved (no approval workflow)
    // Type 2, 3, 4:
    //   - If applied by employee -> Pending (formal workflow requires owner/manager review)
    //   - If recorded by owner/manager -> Approved by default (or custom status provided)
    let status = 'Pending';
    if (isSoleOperator) {
      status = 'Approved';
    } else if (!isEmployee) {
      status = req.body.status || 'Approved';
    }

    const reviewerName = req.user.fullName || req.user.name || req.user.email || 'Owner';

    const payload = {
      ...req.body,
      category,
      startDate,
      endDate,
      tenantId: req.user.id,
      employeeId: targetEmployeeId,
      status,
      appliedByRole: isEmployee ? 'employee' : (req.user.role === 'branch' ? 'manager' : 'owner'),
      appliedBy: isEmployee ? (req.user.fullName || req.user.name || req.user.email || 'Employee') : reviewerName
    };

    if (status === 'Approved' && !isEmployee) {
      payload.reviewedBy = reviewerName;
      payload.reviewedAt = new Date();
      if (!payload.reviewNote && isSoleOperator) {
        payload.reviewNote = 'Directly recorded by Owner (Type 1)';
      }
    }

    const newLeave = new Leave(payload);
    const saved = await newLeave.save();
    await saved.populate('employeeId');
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const existing = await Leave.findOne({ _id: req.params.id, tenantId: req.user.id });
    if (!existing) return res.status(404).json({ error: 'Leave request not found' });

    // If employee is editing:
    if (req.user.role === 'employee') {
      if (existing.employeeId?.toString() !== req.user.employeeId?.toString()) {
        return res.status(403).json({ error: 'Unauthorized to modify this request' });
      }
      if (existing.status !== 'Pending') {
        return res.status(400).json({ error: 'Cannot modify a request that has already been reviewed' });
      }
      delete req.body.status;
      delete req.body.reviewedBy;
      delete req.body.reviewNote;
      delete req.body.reviewedAt;
      req.body.employeeId = req.user.employeeId;
    }

    if (req.body.category === 'Permission' && !req.body.endDate) {
      req.body.endDate = req.body.startDate;
    }

    const updated = await Leave.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.id },
      req.body,
      { new: true }
    ).populate('employeeId');

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    // Formal permission/approval system: employee leave requests require owner/manager review and approval
    // Employees are strictly forbidden from approving/rejecting!
    if (req.user.role === 'employee') {
      return res.status(403).json({ error: 'Employees cannot approve or reject requests' });
    }

    const { status, reviewNote } = req.body;
    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const reviewerName = req.user.fullName || req.user.name || req.user.email || 'Manager / Owner';

    const updateFields = {
      status,
      reviewedBy: reviewerName,
      reviewedAt: new Date()
    };
    if (reviewNote !== undefined) {
      updateFields.reviewNote = reviewNote;
    }

    const leave = await Leave.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.id },
      updateFields,
      { new: true }
    ).populate('employeeId');

    if (!leave) return res.status(404).json({ error: 'Leave request not found' });
    res.json(leave);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const existing = await Leave.findOne({ _id: req.params.id, tenantId: req.user.id });
    if (!existing) return res.status(404).json({ error: 'Leave request not found' });

    if (req.user.role === 'employee') {
      if (existing.employeeId?.toString() !== req.user.employeeId?.toString()) {
        return res.status(403).json({ error: 'Unauthorized to delete this request' });
      }
      if (existing.status !== 'Pending') {
        return res.status(400).json({ error: 'Cannot delete a request that has already been reviewed' });
      }
    }

    await Leave.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
