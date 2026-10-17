const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  manager: { type: String, required: true },
  contactNumber: { type: String, required: true },
  type: { type: String, default: 'Store' },
  businessName: { type: String, default: '' },
  tenantId: { type: String, default: 'default_tenant' },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  password: { type: String },
  isLoginEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Branch', branchSchema);