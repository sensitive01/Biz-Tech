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
    if (req.user.role === 'branch' && req.user.branchId) {
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
    const newLeave = new Leave({ ...req.body, tenantId: req.user.id });
    const saved = await newLeave.save();
    await saved.populate('employeeId');
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Leave.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.id },
      req.body,
      { new: true }
    ).populate('employeeId');
    if (!updated) return res.status(404).json({ error: 'Leave request not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await Leave.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.id },
      { status },
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
    const record = await Leave.findOneAndDelete({ _id: req.params.id, tenantId: req.user.id });
    if (!record) return res.status(404).json({ error: 'Leave request not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;