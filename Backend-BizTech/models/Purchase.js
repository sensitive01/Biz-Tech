const mongoose = require('mongoose');

const PurchaseItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  sku: { type: String, default: '' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  categoryName: { type: String, default: '' },
  subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
  subCategoryName: { type: String, default: '' },
  unit: { type: String, default: 'pcs' },
  measurementType: { type: String, default: 'Piece' },
  isNewProduct: { type: Boolean, default: false },
  quantity: { type: Number, required: true, default: 1 },
  unitCost: { type: Number, required: true, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  totalCost: { type: Number, required: true, default: 0 }
});

const PurchaseSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  poNumber: { type: String, default: '' },
  supplierName: { type: String, default: '' },
  supplierPhone: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  items: [PurchaseItemSchema],
  amount: { type: Number, required: true, default: 0 },
  status: { type: String, default: 'Received' },
  paymentStatus: { type: String, default: 'Paid' },
  paymentMethod: { type: String, default: 'Cash' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Purchase', PurchaseSchema);