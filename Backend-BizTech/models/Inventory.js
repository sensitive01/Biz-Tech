const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemName: { type: String },
  sku: { type: String },
  category: { type: String },
  quantity: { type: Number },
  price: { type: Number },
  costPrice: { type: Number },
  supplier: { type: String },
  batchNumber: { type: String },
  location: { type: String },
  notes: { type: String },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inventory', InventorySchema);