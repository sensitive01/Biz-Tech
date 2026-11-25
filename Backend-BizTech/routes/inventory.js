const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const Category = require('../models/Category');
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

// GET /api/inventory - returns all inventory items, auto-syncing any missing products
router.get('/', auth, async (req, res) => {
  try {
    // Auto-sync: Ensure all physical products (non-service) have a corresponding Inventory record
    const products = await Product.find({
      tenantId: req.user.id,
      itemType: { $ne: 'Service' }
    }).populate('categoryId', 'name');

    if (products.length > 0) {
      const existingInvs = await Inventory.find({ tenantId: req.user.id });
      const linkedProductIds = new Set(existingInvs.map(inv => String(inv.productId || '')));

      for (const prod of products) {
        const prodIdStr = String(prod._id);
        if (!linkedProductIds.has(prodIdStr)) {
          // Check if an inventory item with the same name exists unlinked
          const unlinkedItem = existingInvs.find(
            inv => !inv.productId && (inv.itemName || '').trim().toLowerCase() === (prod.name || '').trim().toLowerCase()
          );

          if (unlinkedItem) {
            await Inventory.findByIdAndUpdate(unlinkedItem._id, {
              $set: {
                productId: prod._id,
                quantity: Number(prod.stock) || 0,
                price: Number(prod.price) || 0,
                sku: prod.sku || '',
                category: prod.categoryId?.name || ''
              }
            });
            linkedProductIds.add(prodIdStr);
          } else {
            await Inventory.create({
              tenantId: req.user.id,
              productId: prod._id,
              itemName: prod.name,
              sku: prod.sku || '',
              category: prod.categoryId?.name || '',
              quantity: Number(prod.stock) || 0,
              price: Number(prod.price) || 0
            });
            linkedProductIds.add(prodIdStr);
          }
        }
      }
    }

    const items = await Inventory.find({ tenantId: req.user.id })
      .populate('productId', 'name sku price stock image itemType')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/inventory - Add or replenish stock (supports selecting an existing product)
router.post('/', auth, async (req, res) => {
  try {
    const { productId, itemName, sku, category, quantity, price, mode, quantityToAdd, supplier, costPrice, batchNumber, location, notes } = req.body;

    let targetProduct = null;
    if (productId) {
      targetProduct = await Product.findOne({ _id: productId, tenantId: req.user.id });
    }

    // Check if an inventory record already exists for this product or item name
    let existingInv = null;
    if (productId) {
      existingInv = await Inventory.findOne({ productId, tenantId: req.user.id });
    } else if (itemName) {
      existingInv = await Inventory.findOne({
        tenantId: req.user.id,
        itemName: { $regex: new RegExp(`^${itemName.trim()}$`, 'i') }
      });
    }

    // Calculate final quantity
    let finalQty = Number(quantity) || 0;
    if (mode === 'add' && quantityToAdd !== undefined) {
      const baseQty = existingInv ? (Number(existingInv.quantity) || 0) : (targetProduct ? (Number(targetProduct.stock) || 0) : 0);
      finalQty = baseQty + (Number(quantityToAdd) || 0);
    }

    if (existingInv) {
      existingInv.quantity = finalQty;
      if (price !== undefined && price !== '') existingInv.price = Number(price);
      if (costPrice !== undefined && costPrice !== '') existingInv.costPrice = Number(costPrice);
      if (supplier !== undefined) existingInv.supplier = supplier;
      if (batchNumber !== undefined) existingInv.batchNumber = batchNumber;
      if (location !== undefined) existingInv.location = location;
      if (notes !== undefined) existingInv.notes = notes;
      if (sku) existingInv.sku = sku;
      if (category) existingInv.category = category;
      if (itemName) existingInv.itemName = itemName;
      if (productId) existingInv.productId = productId;
      await existingInv.save();

      // Sync updated stock to linked Product
      const prodId = productId || existingInv.productId;
      if (prodId) {
        await Product.findOneAndUpdate(
          { _id: prodId, tenantId: req.user.id },
          {
            $set: {
              stock: finalQty,
              ...(price !== undefined && price !== '' ? { price: Number(price) } : {})
            }
          }
        );
      }

      const populated = await Inventory.findById(existingInv._id).populate('productId', 'name sku price stock image itemType');
      return res.json(populated || existingInv);
    }

    // New inventory record
    const finalItemName = itemName || targetProduct?.name || 'Item';
    const finalSku = sku || targetProduct?.sku || '';
    const finalPrice = price !== undefined && price !== '' ? Number(price) : (targetProduct?.price || 0);

    const newItem = new Inventory({
      tenantId: req.user.id,
      productId: productId || undefined,
      itemName: finalItemName,
      sku: finalSku,
      category: category || '',
      quantity: finalQty,
      price: finalPrice,
      costPrice: costPrice !== undefined && costPrice !== '' ? Number(costPrice) : undefined,
      supplier: supplier || '',
      batchNumber: batchNumber || '',
      location: location || '',
      notes: notes || ''
    });
    const saved = await newItem.save();

    // If linked to product, sync product stock
    if (productId) {
      await Product.findOneAndUpdate(
        { _id: productId, tenantId: req.user.id },
        { $set: { stock: finalQty } }
      );
    } else {
      // Auto-create product in catalogue if not existing
      let prod = await Product.findOne({ tenantId: req.user.id, name: finalItemName });
      if (!prod) {
        prod = await Product.create({
          tenantId: req.user.id,
          name: finalItemName,
          sku: finalSku,
          price: finalPrice,
          stock: finalQty,
          itemType: 'Product',
          description: 'Created via Inventory'
        });
      } else {
        prod.stock = finalQty;
        await prod.save();
      }
      saved.productId = prod._id;
      await saved.save();
    }

    const populated = await Inventory.findById(saved._id).populate('productId', 'name sku price stock image itemType');
    res.json(populated || saved);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /api/inventory/:id - Update inventory record & sync Product stock
router.put('/:id', auth, async (req, res) => {
  try {
    const { itemName, sku, category, quantity, price, productId, supplier, costPrice, batchNumber, location, notes } = req.body;
    const finalQty = Number(quantity) || 0;

    const updated = await Inventory.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.id },
      {
        $set: {
          ...(itemName ? { itemName } : {}),
          ...(sku !== undefined ? { sku } : {}),
          ...(category !== undefined ? { category } : {}),
          quantity: finalQty,
          ...(price !== undefined ? { price: Number(price) } : {}),
          ...(costPrice !== undefined && costPrice !== '' ? { costPrice: Number(costPrice) } : {}),
          ...(supplier !== undefined ? { supplier } : {}),
          ...(batchNumber !== undefined ? { batchNumber } : {}),
          ...(location !== undefined ? { location } : {}),
          ...(notes !== undefined ? { notes } : {}),
          ...(productId ? { productId } : {})
        }
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Inventory item not found' });

    // Sync back to linked Product
    const prodId = updated.productId || productId;
    if (prodId) {
      await Product.findOneAndUpdate(
        { _id: prodId, tenantId: req.user.id },
        {
          $set: {
            stock: finalQty,
            ...(updated.price !== undefined ? { price: Number(updated.price) } : {})
          }
        }
      );
    }

    const populated = await Inventory.findById(updated._id).populate('productId', 'name sku price stock image itemType');
    res.json(populated || updated);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE /api/inventory/:id - Delete inventory item and reset stock to 0
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Inventory.findOneAndDelete({ _id: req.params.id, tenantId: req.user.id });
    if (item && item.productId) {
      await Product.findOneAndUpdate(
        { _id: item.productId, tenantId: req.user.id },
        { $set: { stock: 0 } }
      );
    }
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;