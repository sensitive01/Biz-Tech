const mongoose = require('mongoose');

const investorSchema = new mongoose.Schema({
  investorId: { type: String, trim: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: '', trim: true },
  investmentAmount: { type: Number, default: 0 },
  investmentDate: { type: Date, default: Date.now },
  ownershipPercentage: { type: Number, default: 0 },
  associatedBusiness: { type: String, default: 'All Businesses' },
  associatedBranch: { type: String, default: 'All Branches' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  isLoginEnabled: { type: Boolean, default: true },
  notes: { type: String, default: '' },
  role: { type: String, default: 'investor' },
  tenantId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Investor', investorSchema);

