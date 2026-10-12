const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Branch = require('../models/Branch');
const Employee = require('../models/Employee');

// Helper to generate a unique human-readable tenant ID
const generateUserId = async () => {
  const count = await User.countDocuments();
  let candidate = `BT-${1000 + count + 1}`;
  let exists = await User.findOne({ userId: candidate });
  while (exists) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    candidate = `BT-${randomSuffix}`;
    exists = await User.findOne({ userId: candidate });
  }
  return candidate;
};

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

    // Create new user with unique ID
    const userId = await generateUserId();
    user = new User({
      fullName,
      email,
      phone,
      password,
      userId,
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
        res.status(201).json({ 
          token, 
          user: { 
            id: user.id, 
            userId: user.userId,
            fullName, 
            email, 
            businessType: user.businessType, 
            modules: user.modules 
          } 
        });
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

    // Ensure existing user has uniqueId
    if (!user.userId) {
      user.userId = user.get('uniqueId') || await generateUserId();
      await user.save();
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
        res.json({ 
          token, 
          user: { 
            id: user.id, 
            userId: user.userId,
            fullName: user.fullName, 
            email, 
            businessType: user.businessType, 
            modules: user.modules 
          } 
        });
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
// @route   POST /api/auth/onboarding
// @desc    Complete or update onboarding process
router.post('/onboarding', async (req, res) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const { businesses, singleBusiness, businessName, address, regNo, phone, branches, employees, modules } = req.body;
    const userId = decoded.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 1. Update User details (business, modules, etc.)
    if (singleBusiness) {
      if (singleBusiness.name) user.businessName = singleBusiness.name;
      if (singleBusiness.address) user.address = singleBusiness.address;
      if (singleBusiness.regNo) user.regNo = singleBusiness.regNo;
      if (singleBusiness.phone) user.businessPhone = singleBusiness.phone;
    }
    if (businessName) user.businessName = businessName;
    if (address) user.address = address;
    if (regNo) user.regNo = regNo;
    if (phone && !user.businessPhone) user.businessPhone = phone;

    if (modules && Array.isArray(modules) && modules.length > 0) user.modules = modules;
    if (businesses && Array.isArray(businesses) && businesses.length > 0) user.businesses = businesses;
    await user.save();

    // 2. Upsert Branches
    if (branches && branches.length > 0) {
      for (const b of branches) {
        if (!b.name) continue;
        await Branch.findOneAndUpdate(
          { tenantId: userId, name: b.name },
          {
            name: b.name,
            location: b.location || '',
            manager: b.manager || '',
            contactNumber: b.phone || b.contactNumber || '',
            type: b.type || 'Store',
            businessName: b.business || b.businessName || '',
            tenantId: userId
          },
          { upsert: true, new: true }
        );
      }
    }

    // 3. Upsert Employees
    if (employees && employees.length > 0) {
      const createdBranches = await Branch.find({ tenantId: userId });
      const branchMap = {};
      createdBranches.forEach(b => {
        branchMap[b.name] = b._id;
      });

      for (const e of employees) {
        if (!e.name || !e.email) continue;
        const salary = typeof e.salary === 'number' ? e.salary : (parseInt((e.salary || '').replace(/[^0-9]/g, ''), 10) || 0);
        await Employee.findOneAndUpdate(
          { email: e.email },
          {
            name: e.name,
            email: e.email,
            position: e.role || e.position || 'Staff',
            contactNumber: e.phone || e.contactNumber || '',
            salary,
            shiftFrom: e.shiftFrom || '',
            shiftTo: e.shiftTo || '',
            businessName: e.business || e.businessName || '',
            branchName: e.branch || e.branchName || 'Main Office',
            branchId: branchMap[e.branch || e.branchName] || null,
            tenantId: userId
          },
          { upsert: true, new: true }
        );
      }
    }

    const updatedUser = await User.findById(userId).select('-password');
    res.json({ message: 'Onboarding saved successfully', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/auth/onboarding-data
// @desc    Get user onboarding & setup data to prefill wizard
router.get('/onboarding-data', async (req, res) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    let user = await User.findById(decoded.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.userId) {
      user.userId = user.get('uniqueId') || await generateUserId();
      await user.save();
    }

    const branches = await Branch.find({
      $or: [{ tenantId: user.id }, { tenantId: 'default_tenant' }]
    });
    const employees = await Employee.find({
      $or: [{ tenantId: user.id }, { tenantId: 'default_tenant' }]
    });

    res.json({
      user,
      branches,
      employees
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get user profile
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    let user = await User.findById(decoded.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.userId) {
      user.userId = user.get('uniqueId') || await generateUserId();
      await user.save();
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const { fullName, phone, businessName, industry, address, regNo, businessPhone } = req.body;

    const user = await User.findById(decoded.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (businessName !== undefined) user.businessName = businessName;
    if (industry !== undefined) user.industry = industry;
    if (address !== undefined) user.address = address;
    if (regNo !== undefined) user.regNo = regNo;
    if (businessPhone !== undefined) user.businessPhone = businessPhone;

    await user.save();
    const updatedUser = await User.findById(user._id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
router.put('/change-password', async (req, res) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(decoded.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Validate current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password does not match' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;