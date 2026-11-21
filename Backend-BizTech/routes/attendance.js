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

const calcHours = (inTime, outTime, status) => {
  if (status === 'Absent') return '0h 0m';
  if (!inTime || !outTime) return '';
  const [inH, inM] = inTime.split(':').map(Number);
  const [outH, outM] = outTime.split(':').map(Number);
  if (isNaN(inH) || isNaN(inM) || isNaN(outH) || isNaN(outM)) return '';
  let diff = (outH * 60 + outM) - (inH * 60 + inM);
  if (diff < 0) diff += 24 * 60;
  const hrs = Math.floor(diff / 60);
  const mins = diff % 60;
  return `${hrs}h ${mins}m`;
};

router.post('/', auth, async (req, res) => {
  try {
    const computedHours = req.body.workingHours || calcHours(req.body.checkIn, req.body.checkOut, req.body.status);
    const payload = {
      ...req.body,
      workingHours: computedHours,
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
    const existing = await Attendance.findOne({ _id: req.params.id, tenantId: req.user.id });
    if (!existing) return res.status(404).json({ error: 'Record not found' });
    
    existing.checkOut = req.body.checkOut;
    existing.workingHours = calcHours(existing.checkIn, req.body.checkOut, existing.status);
    const saved = await existing.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.checkIn || updateData.checkOut || updateData.status) {
      updateData.workingHours = updateData.workingHours || calcHours(updateData.checkIn, updateData.checkOut, updateData.status);
    }
    const record = await Attendance.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.id },
      updateData,
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