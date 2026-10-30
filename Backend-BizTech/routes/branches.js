const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { checkEmailInUse } = require('../utils/emailValidator');

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

    // If logged in as a business, scope to this business
    if (req.user.role === 'business' && req.user.businessName) {
      query.businessName = { $regex: new RegExp(`^${req.user.businessName.trim()}$`, 'i') };
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

    if (req.user.role === 'business' && req.user.businessName) {
      branchData.businessName = req.user.businessName;
    }

    if (branchData.email && branchData.email.trim()) {
      branchData.email = branchData.email.trim().toLowerCase();
      const emailCheck = await checkEmailInUse(branchData.email);
      if (emailCheck.taken) {
        return res.status(400).json({ error: emailCheck.message });
      }
    } else {
      delete branchData.email;
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
// @desc    Set or update branch login credentials (Owner or Business managing own branch)
router.put('/:id/credentials', auth, async (req, res) => {
  try {
    const { email, password, isLoginEnabled } = req.body;
    const filter = { _id: req.params.id, tenantId: req.user.id };
    if (req.user.role === 'business' && req.user.businessName) {
      filter.businessName = { $regex: new RegExp(`^${req.user.businessName.trim()}$`, 'i') };
    }

    const branch = await Branch.findOne(filter);
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found or unauthorized' });
    }

    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      const emailCheck = await checkEmailInUse(cleanEmail, { type: 'branch', id: branch._id });
      if (emailCheck.taken) {
        return res.status(400).json({ error: emailCheck.message });
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
// @desc    Update branch details (Owner or Business managing own branch)
router.put('/:id', auth, async (req, res) => {
  try {
    const filter = { _id: req.params.id, tenantId: req.user.id };
    if (req.user.role === 'business' && req.user.businessName) {
      filter.businessName = { $regex: new RegExp(`^${req.user.businessName.trim()}$`, 'i') };
    }

    const updateData = { ...req.body };
    delete updateData.tenantId; // Never allow reassigning tenantId

    if (updateData.email && updateData.email.trim()) {
      updateData.email = updateData.email.trim().toLowerCase();
      const emailCheck = await checkEmailInUse(updateData.email, { type: 'branch', id: req.params.id });
      if (emailCheck.taken) {
        return res.status(400).json({ error: emailCheck.message });
      }
    } else if (updateData.email !== undefined) {
      delete updateData.email;
    }

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    } else {
      delete updateData.password;
    }

    const updated = await Branch.findOneAndUpdate(
      filter,
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
// @desc    Delete branch (Owner or Business managing own branch)
router.delete('/:id', auth, async (req, res) => {
  try {
    const filter = { _id: req.params.id, tenantId: req.user.id };
    if (req.user.role === 'business' && req.user.businessName) {
      filter.businessName = { $regex: new RegExp(`^${req.user.businessName.trim()}$`, 'i') };
    }

    const deletedBranch = await Branch.findOneAndDelete(filter);

    if (!deletedBranch) {
      return res.status(404).json({ error: 'Branch not found or unauthorized' });
    }
    res.json({ message: 'Branch deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;