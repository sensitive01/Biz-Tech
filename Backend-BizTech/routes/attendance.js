const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
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
    const records = await Attendance.find({ tenantId: req.user.id }).populate('employeeId').sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const newRecord = new Attendance({ ...req.body, tenantId: req.user.id });
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