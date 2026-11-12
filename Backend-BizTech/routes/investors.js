const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Investor = require('../models/Investor');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Branch = require('../models/Branch');
const { checkEmailInUse } = require('../utils/emailValidator');

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

// @route   GET /api/investors
// @desc    Get all investors for the tenant (Type 3 & 4)
router.get('/', auth, async (req, res) => {
  try {
    const tenantId = req.user.id;
    const investors = await Investor.find({ tenantId }).select('-password').sort({ createdAt: -1 });
    res.json(investors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/investors
// @desc    Create a new investor with portal login (Owner only, Type 3 & 4)
router.post('/', auth, async (req, res) => {
  try {
    // 1. Role validation: Only owners can create investors
    if (req.user.role === 'employee' || req.user.role === 'branch' || req.user.role === 'investor') {
      return res.status(403).json({ error: 'Only the business owner has authority to add investor profiles.' });
    }

    // 2. Tier validation: Type 3 and Type 4 only
    const businessType = Number(req.user.businessType);
    if (businessType !== 3 && businessType !== 4) {
      return res.status(403).json({ error: 'Investor Management is available exclusively for Type 3 (Multi-Branch) and Type 4 (Multi-Business) accounts.' });
    }

    const { 
      name, 
      email, 
      password, 
      phone, 
      investmentAmount, 
      investmentDate, 
      ownershipPercentage, 
      associatedBusiness, 
      associatedBranch, 
      status, 
      isLoginEnabled,
      notes 
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 3. Check email uniqueness across all entities
    const emailCheck = await checkEmailInUse(cleanEmail);
    if (emailCheck.taken) {
      return res.status(400).json({ error: emailCheck.message });
    }

    // Hash the password for secure login
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate readable investor ID
    const count = await Investor.countDocuments({ tenantId: req.user.id });
    const investorCode = `INV-${String(count + 1).padStart(3, '0')}`;

    const newInvestor = new Investor({
      investorId: investorCode,
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      phone: phone || '',
      investmentAmount: Number(investmentAmount) || 0,
      investmentDate: investmentDate || new Date(),
      ownershipPercentage: Number(ownershipPercentage) || 0,
      associatedBusiness: associatedBusiness || 'All Businesses',
      associatedBranch: associatedBranch || 'All Branches',
      status: status || 'Active',
      isLoginEnabled: isLoginEnabled !== undefined ? isLoginEnabled : true,
      notes: notes || '',
      role: 'investor',
      tenantId: req.user.id
    });

    const saved = await newInvestor.save();
    const result = saved.toObject();
    delete result.password;

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @route   PUT /api/investors/:id
// @desc    Update investor profile & login settings (Owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    // Only owners can edit
    if (req.user.role === 'employee' || req.user.role === 'branch' || req.user.role === 'investor') {
      return res.status(403).json({ error: 'Only the business owner has authority to edit investor profiles.' });
    }

    const investor = await Investor.findOne({ _id: req.params.id, tenantId: req.user.id });
    if (!investor) {
      return res.status(404).json({ error: 'Investor not found.' });
    }

    const { 
      name, 
      email, 
      password, 
      phone, 
      investmentAmount, 
      investmentDate, 
      ownershipPercentage, 
      associatedBusiness, 
      associatedBranch, 
      status, 
      isLoginEnabled,
      notes 
    } = req.body;

    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail !== investor.email) {
        const emailCheck = await checkEmailInUse(cleanEmail, { type: 'investor', id: investor._id });
        if (emailCheck.taken) {
          return res.status(400).json({ error: emailCheck.message });
        }
        investor.email = cleanEmail;
      }
    }

    if (name) investor.name = name.trim();
    if (phone !== undefined) investor.phone = phone;
    if (investmentAmount !== undefined) investor.investmentAmount = Number(investmentAmount);
    if (investmentDate !== undefined) investor.investmentDate = investmentDate;
    if (ownershipPercentage !== undefined) investor.ownershipPercentage = Number(ownershipPercentage);
    if (associatedBusiness !== undefined) investor.associatedBusiness = associatedBusiness;
    if (associatedBranch !== undefined) investor.associatedBranch = associatedBranch;
    if (status !== undefined) investor.status = status;
    if (isLoginEnabled !== undefined) investor.isLoginEnabled = isLoginEnabled;
    if (notes !== undefined) investor.notes = notes;

    // Optional password reset
    if (password && password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      investor.password = await bcrypt.hash(password.trim(), salt);
    }

    await investor.save();
    const result = investor.toObject();
    delete result.password;

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @route   DELETE /api/investors/:id
// @desc    Delete investor (Owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role === 'employee' || req.user.role === 'branch' || req.user.role === 'investor') {
      return res.status(403).json({ error: 'Only the business owner has authority to remove investor profiles.' });
    }

    const investor = await Investor.findOneAndDelete({ _id: req.params.id, tenantId: req.user.id });
    if (!investor) {
      return res.status(404).json({ error: 'Investor not found.' });
    }

    res.json({ message: 'Investor profile removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
