const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');

const jwt = require('jsonwebtoken');

// Get all branches
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
    const branches = await Branch.find(query).sort({ createdAt: -1 });
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new branch
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
    const newBranch = new Branch({ ...req.body, tenantId });
    const savedBranch = await newBranch.save();
    res.status(201).json(savedBranch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a branch
router.put('/:id', async (req, res) => {
  try {
    const updated = await Branch.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a branch
router.delete('/:id', async (req, res) => {
  try {
    const deletedBranch = await Branch.findByIdAndDelete(req.params.id);
    if (!deletedBranch) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    res.json({ message: 'Branch deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;