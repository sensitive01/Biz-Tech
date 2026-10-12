const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
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
    const items = await Product.find({ tenantId: req.user.id })
      .populate('categoryId', 'name')
      .populate('subCategoryId', 'name')
      .sort({ createdAt: -1 });
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
    const newItem = new Product({ ...data, tenantId: req.user.id });
    const saved = await newItem.save();

    // Automatically sync Product items into Inventory
    if (saved.itemType === 'Product') {
      let categoryName = '';
      if (saved.categoryId) {
        const cat = await Category.findById(saved.categoryId);
        if (cat) categoryName = cat.name;
      }
      await Inventory.create({
        tenantId: req.user.id,
        itemName: saved.name,
        sku: saved.sku || '',
        category: categoryName,
        quantity: Number(saved.stock) || 0,
        price: Number(saved.price) || 0,
        productId: saved._id
      });
    }

    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = req.file.path;
    }
    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.id },
      { $set: data },
      { new: true }
    );

    if (updated && updated.itemType === 'Product') {
      let categoryName = '';
      if (updated.categoryId) {
        const cat = await Category.findById(updated.categoryId);
        if (cat) categoryName = cat.name;
      }
      await Inventory.findOneAndUpdate(
        { productId: updated._id, tenantId: req.user.id },
        {
          $set: {
            itemName: updated.name,
            sku: updated.sku || '',
            category: categoryName,
            quantity: Number(updated.stock) || 0,
            price: Number(updated.price) || 0
          }
        },
        { upsert: true }
      );
    } else if (updated && updated.itemType === 'Service') {
      await Inventory.deleteMany({ productId: updated._id, tenantId: req.user.id });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Product.findOneAndDelete({ _id: req.params.id, tenantId: req.user.id });
    await Inventory.deleteMany({ productId: req.params.id, tenantId: req.user.id });
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;