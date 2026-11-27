const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invoiceNo: { type: String },
  customerName: { type: String },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerPhone: { type: String },
  customerEmail: { type: String },
  customerAddress: { type: String },
  billingType: { type: String, default: 'Product' }, // 'Product' or 'Service'
  date: { type: Date, default: Date.now },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: { type: String },
      quantity: { type: Number, default: 1 },
      unit: { type: String, default: 'pcs' },
      unitPrice: { type: Number, default: 0 },
      amount: { type: Number, default: 0 }
    }
  ],
  amount: { type: Number, default: 0 },
  status: { type: String, default: 'Paid' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sale', SaleSchema);
