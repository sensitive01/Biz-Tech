const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  poNumber: { type: String },
  supplierName: { type: String },
  date: { type: Date },
  amount: { type: Number },
  status: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Purchase', PurchaseSchema);
