const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const jwt = require('jsonwebtoken');

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
    const items = await Sale.find({ tenantId: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const newItem = new Sale({ ...req.body, tenantId: req.user.id });
    const saved = await newItem.save();

    // Deduct stock in Product & Inventory if items were sold
    if (Array.isArray(req.body.items) && req.body.items.length > 0) {
      for (const it of req.body.items) {
        if (it.productId) {
          try {
            const baseQtyToDeduct = Number(it.quantity) || 1;

            // Deduct from Product stock
            await Product.findOneAndUpdate(
              { _id: it.productId, tenantId: req.user.id },
              { $inc: { stock: -baseQtyToDeduct } }
            );

            // Deduct from Inventory quantity
            await Inventory.findOneAndUpdate(
              { productId: it.productId, tenantId: req.user.id },
              { $inc: { quantity: -baseQtyToDeduct } }
            );
          } catch (stockErr) {
            console.error('Error deducting product stock:', stockErr);
          }
        }
      }
    }

    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Sale.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.id },
      { ...req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Sale not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const existing = await Sale.findOne({ _id: req.params.id, tenantId: req.user.id });
    if (existing && Array.isArray(existing.items) && existing.items.length > 0) {
      for (const it of existing.items) {
        if (it.productId) {
          try {
            const baseQtyToRestore = Number(it.quantity) || 1;

            await Product.findOneAndUpdate(
              { _id: it.productId, tenantId: req.user.id },
              { $inc: { stock: baseQtyToRestore } }
            );

            await Inventory.findOneAndUpdate(
              { productId: it.productId, tenantId: req.user.id },
              { $inc: { quantity: baseQtyToRestore } }
            );
          } catch (restoreErr) {
            console.error('Error restoring stock:', restoreErr);
          }
        }
      }
    }

    await Sale.findOneAndDelete({ _id: req.params.id, tenantId: req.user.id });
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;