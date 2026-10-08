const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const jwt = require('jsonwebtoken');
const { upload } = require('../config/cloudinary');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
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
    const items = await Expense.find({ tenantId: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/', auth, upload.single('proof'), async (req, res) => {
  try {
    const proofUrl = req.file ? req.file.path : null;
    const { title, category, customCategory, description, date, amount } = req.body;
    
    const finalCategory = category === 'Other' ? customCategory : category;

    const newItem = new Expense({ 
      title,
      category: finalCategory,
      description,
      date,
      amount,
      proofUrl,
      tenantId: req.user.id 
    });
    
    const saved = await newItem.save();
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Expense.findOneAndDelete({ _id: req.params.id, tenantId: req.user.id });
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
