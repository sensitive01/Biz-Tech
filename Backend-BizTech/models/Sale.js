const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invoiceNo: { type: String },
  customerName: { type: String },
  date: { type: Date },
  amount: { type: Number },
  status: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sale', SaleSchema);
