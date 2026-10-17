const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
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

// @route   GET /api/branches
// @desc    Get all branches for the authenticated user only
router.get('/', auth, async (req, res) => {
  try {
    let query = { tenantId: req.user.id };

    // If logged in as a branch, scope strictly to this branch
    if (req.user.role === 'branch' && req.user.branchId) {
      query._id = req.user.branchId;
    }

    const branches = await Branch.find(query).select('-password').sort({ createdAt: -1 });
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/branches
// @desc    Add a new branch for the authenticated tenant
router.post('/', auth, async (req, res) => {
  try {
    const tenantId = req.user.id;
    const branchData = { ...req.body, tenantId };

    if (branchData.email) {
      branchData.email = branchData.email.trim().toLowerCase();
      // Ensure unique email across users and branches
      const userExists = await User.findOne({ email: branchData.email });
      if (userExists) {
        return res.status(400).json({ error: 'This email is already in use by a business account.' });
      }
      const branchExists = await Branch.findOne({ email: branchData.email });
      if (branchExists) {
        return res.status(400).json({ error: 'This email is already assigned to another branch.' });
      }
    }

    if (branchData.password) {
      const salt = await bcrypt.genSalt(10);
      branchData.password = await bcrypt.hash(branchData.password, salt);
    }

    const newBranch = new Branch(branchData);
    const savedBranch = await newBranch.save();
    const result = savedBranch.toObject();
    delete result.password;
    res.status(201).json(result);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'A branch with this email already exists.' });
    }
    res.status(400).json({ error: err.message });
  }
});

// @route   PUT /api/branches/:id/credentials
// @desc    Set or update branch login credentials (Owner only for their own branch)
router.put('/:id/credentials', auth, async (req, res) => {
  try {
    const { email, password, isLoginEnabled } = req.body;
    const branch = await Branch.findOne({ _id: req.params.id, tenantId: req.user.id });
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found or unauthorized' });
    }

    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      // Check if email registered to a business account
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return res.status(400).json({ error: 'This email is already in use by a business account.' });
      }
      // Check if email in use by another branch
      const branchExists = await Branch.findOne({ email: cleanEmail, _id: { $ne: branch._id } });
      if (branchExists) {
        return res.status(400).json({ error: 'This email is already assigned to another branch.' });
      }
      branch.email = cleanEmail;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }
      const salt = await bcrypt.genSalt(10);
      branch.password = await bcrypt.hash(password, salt);
    }

    if (typeof isLoginEnabled === 'boolean') {
      branch.isLoginEnabled = isLoginEnabled;
    }

    await branch.save();
    const result = await Branch.findById(branch._id).select('-password');
    res.json(result);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'This email is already assigned to another branch.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/branches/:id
// @desc    Update branch details (Owner only for their own branch)
router.put('/:id', auth, async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.tenantId; // Never allow reassigning tenantId

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    } else {
      delete updateData.password;
    }

    const updated = await Branch.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updated) {
      return res.status(404).json({ error: 'Branch not found or unauthorized' });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @route   DELETE /api/branches/:id
// @desc    Delete branch (Owner only for their own branch)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedBranch = await Branch.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.user.id
    });

    if (!deletedBranch) {
      return res.status(404).json({ error: 'Branch not found or unauthorized' });
    }
    res.json({ message: 'Branch deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;