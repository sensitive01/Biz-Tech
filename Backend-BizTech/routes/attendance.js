const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
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
    const records = await Attendance.find(query).populate('employeeId').sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const payload = {
      ...req.body,
      tenantId: req.user.id,
      employeeId: (req.user.role === 'employee' && req.user.employeeId) ? req.user.employeeId : req.body.employeeId
    };
    const newRecord = new Attendance(payload);
    const saved = await newRecord.save();
    await saved.populate('employeeId');
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id/checkout', auth, async (req, res) => {
  try {
    const record = await Attendance.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.id },
      { checkOut: req.body.checkOut },
      { new: true }
    );
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const record = await Attendance.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.id },
      { ...req.body },
      { new: true }
    );
    if (!record) return res.status(404).json({ error: 'Record not found' });
    await record.populate('employeeId');
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const record = await Attendance.findOneAndDelete({ _id: req.params.id, tenantId: req.user.id });
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;