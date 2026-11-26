const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemName: { type: String },
  sku: { type: String },
  category: { type: String },
  quantity: { type: Number },
  price: { type: Number },
  costPrice: { type: Number },
  unit: { type: String, default: 'pcs' },
  measurementType: { type: String, default: 'Piece' },
  secondaryUnit: { type: String, default: '' },
  conversionFactor: { type: Number, default: 1 },
  supplier: { type: String },
  batchNumber: { type: String },
  location: { type: String },
  notes: { type: String },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inventory', InventorySchema);