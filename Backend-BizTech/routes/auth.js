const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Branch = require('../models/Branch');
const Employee = require('../models/Employee');

// @route   POST /api/auth/check-email
// @desc    Check if email already exists before step 2
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'This email address is already registered. Please sign in instead.' });
    }
    res.status(200).json({ message: 'Email is available' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, password, businessType, businessName, industry, address } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      fullName,
      email,
      phone,
      password,
      businessType: businessType || 1,
      businessName,
      industry,
      address
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        businessType: user.businessType
      }
    };

      // Sign Token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token, user: { id: user.id, fullName, email, businessType: user.businessType, modules: user.modules } });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        businessType: user.businessType
      }
    };

      // Sign Token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, fullName: user.fullName, email, businessType: user.businessType, modules: user.modules } });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

// @route   PUT /api/auth/update-modules
// @desc    Update user modules
router.put('/update-modules', async (req, res) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const { modules } = req.body;

    if (!Array.isArray(modules)) {
      return res.status(400).json({ message: 'Modules must be an array' });
    }

    const user = await User.findByIdAndUpdate(decoded.user.id, { modules }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user: { id: user.id, fullName: user.fullName, email: user.email, businessType: user.businessType, modules: user.modules } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/auth/onboarding
// @desc    Complete onboarding process
router.post('/onboarding', async (req, res) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const { businesses, branches, employees, modules } = req.body;
    const userId = decoded.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 1. Update User (modules and businesses)
    if (modules) user.modules = modules;
    if (businesses && businesses.length > 0) user.businesses = businesses;
    await user.save();

    // 2. Create Branches
    if (branches && branches.length > 0) {
      const branchDocs = branches.map(b => ({
        name: b.name,
        location: b.location,
        manager: b.manager,
        contactNumber: b.phone,
        type: b.type,
        businessName: b.business || '',
        tenantId: userId
      }));
      await Branch.insertMany(branchDocs);
    }

    // 3. Create Employees
    if (employees && employees.length > 0) {
      const createdBranches = await Branch.find({ tenantId: userId });
      const branchMap = {};
      createdBranches.forEach(b => {
        branchMap[b.name] = b._id;
      });

      const empDocs = employees.map(e => ({
        name: e.name,
        email: e.email,
        position: e.role,
        contactNumber: e.phone,
        salary: parseInt((e.salary || '').replace(/[^0-9]/g, ''), 10) || 0,
        shiftFrom: e.shiftFrom,
        shiftTo: e.shiftTo,
        businessName: e.business || '',
        branchName: e.branch || 'Main Office',
        branchId: branchMap[e.branch] || null,
        tenantId: userId
      }));
      await Employee.insertMany(empDocs);
    }

    res.json({ message: 'Onboarding completed successfully', user: { id: user.id, fullName: user.fullName, email: user.email, businessType: user.businessType, modules: user.modules } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get user profile
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;