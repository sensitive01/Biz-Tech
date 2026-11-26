const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  sku: { type: String },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" },
  price: { type: Number },
  stock: { type: Number },
  costPrice: { type: Number },
  measurementType: { type: String, default: 'Piece' },
  unit: { type: String, default: 'pcs' },
  secondaryUnit: { type: String, default: '' },
  conversionFactor: { type: Number, default: 1 },
  image: { type: String },
  itemType: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);