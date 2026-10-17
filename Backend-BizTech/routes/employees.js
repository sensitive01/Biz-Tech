const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');

// Authentication middleware for strict tenant isolation
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No authorization token, access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

// @route   GET /api/employees
// @desc    Get all employees for the authenticated tenant only
router.get('/', auth, async (req, res) => {
  try {
    let query = { tenantId: req.user.id };

    // If logged in as branch, scope to this branch
    if (req.user.role === 'branch' && req.user.branchId) {
      query.branchId = req.user.branchId;
    }

    const employees = await Employee.find(query).populate('branchId').sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/employees
// @desc    Add a new employee for the authenticated tenant
router.post('/', auth, async (req, res) => {
  try {
    let branchId = req.body.branchId;
    if (req.user.role === 'branch' && req.user.branchId) {
      branchId = req.user.branchId;
    }

    const newEmployee = new Employee({
      ...req.body,
      tenantId: req.user.id,
      branchId
    });

    const savedEmployee = await newEmployee.save();
    
    if (savedEmployee.branchId) {
      await savedEmployee.populate('branchId');
    }
    
    res.status(201).json(savedEmployee);
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ error: 'An employee with this email address already exists.' });
    }
    res.status(400).json({ error: err.message });
  }
});

// @route   PUT /api/employees/:id
// @desc    Update employee (Owner or branch only for their own employee)
router.put('/:id', auth, async (req, res) => {
  try {
    const filter = { _id: req.params.id, tenantId: req.user.id };
    if (req.user.role === 'branch' && req.user.branchId) {
      filter.branchId = req.user.branchId;
    }

    const updateData = { ...req.body };
    delete updateData.tenantId; // Never reassign tenantId

    const updated = await Employee.findOneAndUpdate(
      filter,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Employee not found or unauthorized' });
    }
    if (updated.branchId) {
      await updated.populate('branchId');
    }
    res.json(updated);
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ error: 'An employee with this email address already exists.' });
    }
    res.status(400).json({ error: err.message });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete employee (Owner or branch only for their own employee)
router.delete('/:id', auth, async (req, res) => {
  try {
    const filter = { _id: req.params.id, tenantId: req.user.id };
    if (req.user.role === 'branch' && req.user.branchId) {
      filter.branchId = req.user.branchId;
    }

    const deletedEmployee = await Employee.findOneAndDelete(filter);
    if (!deletedEmployee) {
      return res.status(404).json({ error: 'Employee not found or unauthorized' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;