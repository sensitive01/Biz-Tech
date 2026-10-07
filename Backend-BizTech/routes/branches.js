const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');

// Get all branches
router.get('/', async (req, res) => {
  try {
    const branches = await Branch.find().sort({ createdAt: -1 });
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new branch
router.post('/', async (req, res) => {
  try {
    const newBranch = new Branch(req.body);
    const savedBranch = await newBranch.save();
    res.status(201).json(savedBranch);
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
