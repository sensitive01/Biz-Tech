const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');
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

// @route   GET /api/purchases
// @desc    Get all purchases for tenant
router.get('/', auth, async (req, res) => {
  try {
    const items = await Purchase.find({ tenantId: req.user.id })
      .populate('items.productId', 'name sku price stock image')
      .populate('items.categoryId', 'name')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error('Error fetching purchases:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/purchases/:id
// @desc    Get single purchase by id
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Purchase.findOne({ _id: req.params.id, tenantId: req.user.id })
      .populate('items.productId', 'name sku price stock image')
      .populate('items.categoryId', 'name');
    if (!item) return res.status(404).json({ message: 'Purchase not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/purchases
// @desc    Create new purchase and auto-update Product catalog and Stock/Inventory
router.post('/', auth, async (req, res) => {
  try {
    const {
      poNumber,
      supplierName,
      supplierPhone,
      date,
      items = [],
      amount,
      status = 'Received',
      paymentStatus = 'Paid',
      paymentMethod = 'Cash',
      notes
    } = req.body;

    const tenantId = req.user.id;
    const isReceived = String(status || '').toLowerCase() === 'received' || String(status || '').toLowerCase() === 'completed';

    const processedItems = [];
    let calculatedTotal = 0;

    // Support both multi-item array and single-item direct fields fallback
    const itemsToProcess = Array.isArray(items) && items.length > 0 
      ? items 
      : (req.body.productName ? [{
          name: req.body.productName,
          quantity: req.body.quantity || 1,
          unitCost: req.body.unitCost || req.body.amount || 0,
          sellingPrice: req.body.sellingPrice || 0,
          isNewProduct: req.body.isNewProduct || false,
          productId: req.body.productId || null
        }] : []);

    for (const item of itemsToProcess) {
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const unitCost = Math.max(0, Number(item.unitCost) || 0);
      const sellingPrice = Math.max(0, Number(item.sellingPrice) || 0);
      const totalCost = Number(item.totalCost) || (quantity * unitCost);
      calculatedTotal += totalCost;

      let productDoc = null;

      // 1. Try finding product by provided ID
      if (item.productId) {
        productDoc = await Product.findOne({ _id: item.productId, tenantId });
      }

      // 2. If not found by ID, try finding product by name (case-insensitive) for this tenant
      if (!productDoc && item.name) {
        productDoc = await Product.findOne({
          tenantId,
          name: { $regex: new RegExp(`^${item.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });
      }

      if (productDoc) {
        // --- EXISTING PRODUCT AVAILABLE IN CATALOG ---
        // Increment stock by purchased quantity
        if (isReceived) {
          productDoc.stock = (Number(productDoc.stock) || 0) + quantity;
        }
        if (unitCost > 0) {
          productDoc.costPrice = unitCost;
        }
        if (sellingPrice > 0) {
          productDoc.price = sellingPrice;
        }
        await productDoc.save();

        // Automatically sync into Inventory
        let categoryName = item.categoryName || '';
        if (!categoryName && productDoc.categoryId) {
          const cat = await Category.findById(productDoc.categoryId);
          if (cat) categoryName = cat.name;
        }

        await Inventory.findOneAndUpdate(
          { productId: productDoc._id, tenantId },
          {
            $inc: isReceived ? { quantity: quantity } : {},
            $set: {
              itemName: productDoc.name,
              sku: productDoc.sku || '',
              category: categoryName,
              costPrice: unitCost || productDoc.costPrice || 0,
              price: productDoc.price || sellingPrice || 0,
              supplier: supplierName || ''
            }
          },
          { upsert: true, new: true }
        );

        let subCategoryId = productDoc.subCategoryId || item.subCategoryId || null;
        let subCategoryName = item.subCategoryName || '';
        if (!subCategoryName && subCategoryId) {
          const sc = await SubCategory.findById(subCategoryId);
          if (sc) subCategoryName = sc.name;
        }

        processedItems.push({
          productId: productDoc._id,
          name: productDoc.name,
          sku: productDoc.sku || '',
          categoryId: productDoc.categoryId || null,
          categoryName,
          subCategoryId,
          subCategoryName,
          unit: item.unit || productDoc.unit || 'pcs',
          isNewProduct: false,
          quantity,
          unitCost,
          sellingPrice: productDoc.price || sellingPrice,
          totalCost
        });
      } else {
        // --- NEW PRODUCT (Product was NOT available yet) ---
        // Automatically create in Products collection so it shows in the Products section!
        let categoryId = item.categoryId || null;
        let categoryName = item.categoryName || '';

        // If categoryName was provided, resolve or auto-create category
        if (!categoryId && categoryName) {
          let cat = await Category.findOne({
            tenantId,
            name: { $regex: new RegExp(`^${categoryName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
          });
          if (!cat) {
            cat = new Category({
              tenantId,
              name: categoryName.trim(),
              itemType: 'Product',
              transactionType: 'Both'
            });
            await cat.save();
          }
          categoryId = cat._id;
          categoryName = cat.name;
        } else if (categoryId && !categoryName) {
          const cat = await Category.findById(categoryId);
          if (cat) categoryName = cat.name;
        }

        // Resolve subcategory if provided
        let subCategoryId = item.subCategoryId || null;
        let subCategoryName = item.subCategoryName || '';
        if (subCategoryId && !subCategoryName) {
          const sc = await SubCategory.findById(subCategoryId);
          if (sc) subCategoryName = sc.name;
        } else if (!subCategoryId && subCategoryName && categoryId) {
          let sc = await SubCategory.findOne({
            tenantId,
            categoryId,
            name: { $regex: new RegExp(`^${subCategoryName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
          });
          if (!sc) {
            sc = new SubCategory({
              tenantId,
              categoryId,
              name: subCategoryName.trim(),
              itemType: 'Product',
              transactionType: 'Both'
            });
            await sc.save();
          }
          subCategoryId = sc._id;
          subCategoryName = sc.name;
        }

        const sku = (item.sku && item.sku.trim()) || `SKU-${Date.now().toString().slice(-6)}`;
        const finalSellingPrice = sellingPrice > 0 ? sellingPrice : unitCost;
        const itemUnit = item.unit || 'pcs';

        const newProduct = new Product({
          tenantId,
          name: (item.name || 'New Purchased Item').trim(),
          sku,
          categoryId,
          subCategoryId,
          price: finalSellingPrice,
          costPrice: unitCost,
          unit: itemUnit,
          measurementType: item.measurementType || 'Piece',
          stock: isReceived ? quantity : 0,
          itemType: 'Product',
          description: item.description || `Purchased from ${supplierName || 'Supplier'}`
        });

        const savedProduct = await newProduct.save();

        // Create corresponding item in Inventory collection
        await Inventory.create({
          tenantId,
          productId: savedProduct._id,
          itemName: savedProduct.name,
          sku: savedProduct.sku,
          category: categoryName,
          quantity: isReceived ? quantity : 0,
          costPrice: unitCost,
          price: finalSellingPrice,
          unit: itemUnit,
          supplier: supplierName || ''
        });

        processedItems.push({
          productId: savedProduct._id,
          name: savedProduct.name,
          sku: savedProduct.sku,
          categoryId,
          categoryName,
          subCategoryId,
          subCategoryName,
          unit: itemUnit,
          isNewProduct: true,
          quantity,
          unitCost,
          sellingPrice: finalSellingPrice,
          totalCost
        });
      }
    }

    const finalAmount = Number(amount) > 0 ? Number(amount) : calculatedTotal;

    const newPurchase = new Purchase({
      tenantId,
      poNumber: poNumber?.trim() || `PO-${Date.now().toString().slice(-6)}`,
      supplierName: supplierName?.trim() || 'General Supplier',
      supplierPhone: supplierPhone?.trim() || '',
      date: date ? new Date(date) : new Date(),
      items: processedItems,
      amount: finalAmount,
      status: status || 'Received',
      paymentStatus: paymentStatus || 'Paid',
      paymentMethod: paymentMethod || 'Cash',
      notes: notes?.trim() || ''
    });

    const savedPurchase = await newPurchase.save();
    res.json(savedPurchase);
  } catch (err) {
    console.error('Error saving purchase:', err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
});

// @route   PUT /api/purchases/:id
// @desc    Update purchase details
router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Purchase.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.id },
      { ...req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Purchase not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/purchases/:id
// @desc    Delete purchase and safely adjust product & inventory stock
router.delete('/:id', auth, async (req, res) => {
  try {
    const purchase = await Purchase.findOne({ _id: req.params.id, tenantId: req.user.id });
    if (!purchase) return res.status(404).json({ message: 'Purchase not found' });

    // If purchase was Received, revert the added stock
    if (String(purchase.status).toLowerCase() === 'received' && Array.isArray(purchase.items)) {
      for (const item of purchase.items) {
        if (item.productId) {
          const prod = await Product.findOne({ _id: item.productId, tenantId: req.user.id });
          if (prod) {
            prod.stock = Math.max(0, (Number(prod.stock) || 0) - (Number(item.quantity) || 0));
            await prod.save();

            await Inventory.findOneAndUpdate(
              { productId: prod._id, tenantId: req.user.id },
              { $inc: { quantity: -(Number(item.quantity) || 0) } }
            );
          }
        }
      }
    }

    await Purchase.deleteOne({ _id: req.params.id, tenantId: req.user.id });
    res.json({ msg: 'Purchase deleted successfully and stock updated' });
  } catch (err) {
    console.error('Error deleting purchase:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
