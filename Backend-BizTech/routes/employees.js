const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

const jwt = require('jsonwebtoken');

// Get all employees
router.get('/', async (req, res) => {
  try {
    let query = {};
    const authHeader = req.header('Authorization');
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        if (decoded?.user?.id) {
          query = { $or: [{ tenantId: decoded.user.id }, { tenantId: 'default_tenant' }] };
        }
      } catch (e) {}
    }
    const employees = await Employee.find(query).populate('branchId').sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new employee
router.post('/', async (req, res) => {
  try {
    let tenantId = req.body.tenantId || 'default_tenant';
    const authHeader = req.header('Authorization');
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        if (decoded?.user?.id) {
          tenantId = decoded.user.id;
        }
      } catch (e) {}
    }
    const newEmployee = new Employee({ ...req.body, tenantId });
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

// Update an employee
router.put('/:id', async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Employee not found' });
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

// Delete an employee
router.delete('/:id', async (req, res) => {
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
    if (!deletedEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;