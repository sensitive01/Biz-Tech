const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String },
  companyName: { type: String, default: '' },
  customerType: { type: String, default: 'Retail' },
  gstin: { type: String, default: '' },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Customer', CustomerSchema);