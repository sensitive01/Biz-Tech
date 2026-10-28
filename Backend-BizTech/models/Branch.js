const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, default: '' },
  manager: { type: String, default: '' },
  contactNumber: { type: String, default: '' },
  type: { type: String, default: 'Store' },
  businessName: { type: String, default: '' },
  tenantId: { type: String, default: 'default_tenant' },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  password: { type: String },
  isLoginEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Branch', branchSchema);