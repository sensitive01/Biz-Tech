const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
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
    const items = await Category.find({ tenantId: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = req.file.path;
    }
    const newItem = new Category({ ...data, tenantId: req.user.id });
    const saved = await newItem.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Category.findOneAndDelete({ _id: req.params.id, tenantId: req.user.id });
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;