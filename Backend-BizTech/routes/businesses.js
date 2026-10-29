const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Branch = require('../models/Branch');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middleware to authenticate token
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

// Helper to sanitize business for client responses
const sanitizeBusiness = (b) => {
  const obj = b.toObject ? b.toObject() : { ...b };
  const hasPassword = Boolean(obj.password);
  delete obj.password;
  obj.hasPassword = hasPassword;
  return obj;
};

// @route   GET /api/businesses
// @desc    Get all businesses for tenant
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const businesses = (user.businesses || []).map(sanitizeBusiness);
    res.json(businesses);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/businesses
// @desc    Add a new business
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const newBiz = { ...req.body };

    if (newBiz.email && newBiz.email.trim()) {
      const cleanEmail = newBiz.email.trim().toLowerCase();
      // Ensure unique email across users, branches and other businesses
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return res.status(400).json({ error: 'This email is already registered to a primary account.' });
      }
      const branchExists = await Branch.findOne({ email: cleanEmail });
      if (branchExists) {
        return res.status(400).json({ error: 'This email is already assigned to a branch.' });
      }
      const bizExists = await User.findOne({ 'businesses.email': cleanEmail });
      if (bizExists) {
        return res.status(400).json({ error: 'This email is already assigned to another business.' });
      }
      newBiz.email = cleanEmail;
    } else {
      delete newBiz.email;
    }

    if (newBiz.password) {
      if (newBiz.password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      const salt = await bcrypt.genSalt(10);
      newBiz.password = await bcrypt.hash(newBiz.password, salt);
    }

    if (newBiz.isLoginEnabled === undefined) {
      newBiz.isLoginEnabled = true;
    }

    user.businesses.push(newBiz);
    await user.save();
    
    res.status(201).json(user.businesses.map(sanitizeBusiness));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
});

// @route   PUT /api/businesses/:id/credentials
// @desc    Set or update business login credentials
router.put('/:id/credentials', auth, async (req, res) => {
  try {
    const { email, password, isLoginEnabled } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const business = user.businesses.id(req.params.id);
    if (!business) return res.status(404).json({ error: 'Business not found' });

    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      // Check primary accounts
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return res.status(400).json({ error: 'This email is already in use by a primary business account.' });
      }
      // Check branch accounts
      const branchExists = await Branch.findOne({ email: cleanEmail });
      if (branchExists) {
        return res.status(400).json({ error: 'This email is already assigned to a branch.' });
      }
      // Check other businesses
      const otherBizUser = await User.findOne({
        'businesses': {
          $elemMatch: {
            email: cleanEmail,
            _id: { $ne: business._id }
          }
        }
      });
      if (otherBizUser) {
        return res.status(400).json({ error: 'This email is already assigned to another business.' });
      }
      business.email = cleanEmail;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }
      const salt = await bcrypt.genSalt(10);
      business.password = await bcrypt.hash(password, salt);
    }

    if (typeof isLoginEnabled === 'boolean') {
      business.isLoginEnabled = isLoginEnabled;
    }

    await user.save();
    res.json(sanitizeBusiness(business));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server Error' });
  }
});

// @route   PUT /api/businesses/:id
// @desc    Update a business
router.put('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const index = user.businesses.findIndex(b => b._id.toString() === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Business not found' });

    const updateData = { ...req.body };

    if (updateData.email && updateData.email.trim()) {
      const cleanEmail = updateData.email.trim().toLowerCase();
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return res.status(400).json({ error: 'This email is already registered to a primary account.' });
      }
      const branchExists = await Branch.findOne({ email: cleanEmail });
      if (branchExists) {
        return res.status(400).json({ error: 'This email is already assigned to a branch.' });
      }
      const otherBizUser = await User.findOne({
        'businesses': {
          $elemMatch: {
            email: cleanEmail,
            _id: { $ne: user.businesses[index]._id }
          }
        }
      });
      if (otherBizUser) {
        return res.status(400).json({ error: 'This email is already assigned to another business.' });
      }
      updateData.email = cleanEmail;
    } else if (updateData.email !== undefined) {
      delete updateData.email;
    }

    if (updateData.password) {
      if (updateData.password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    } else {
      delete updateData.password;
    }
    
    user.businesses[index] = { ...user.businesses[index].toObject(), ...updateData };
    await user.save();
    
    res.json(user.businesses.map(sanitizeBusiness));
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server Error' });
  }
});

// @route   DELETE /api/businesses/:id
// @desc    Delete a business
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.businesses = user.businesses.filter(b => b._id.toString() !== req.params.id);
    await user.save();
    
    res.json(user.businesses.map(sanitizeBusiness));
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;