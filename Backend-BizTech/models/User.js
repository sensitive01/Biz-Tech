const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    unique: true,
    sparse: true
  },
  businessType: {
    type: Number,
    default: 1
  },
  businessName: {
    type: String,
    required: false
  },
  industry: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  regNo: {
    type: String,
    required: false
  },
  businessPhone: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  modules: {
    type: [String],
    enum: ['products_services', 'inventory', 'purchases', 'sales', 'expenses'],
    default: []
  },
  businesses: [{
    name: String,
    category: { type: String, default: '' },
    contactPerson: { type: String, default: '' },
    taxNumber: { type: String, default: '' },
    city: { type: String, default: '' },
    phone: String,
    address: String,
    email: { type: String, lowercase: true, trim: true },
    password: { type: String },
    isLoginEnabled: { type: Boolean, default: true },
    regNo: String,
    createdAt: { type: Date, default: Date.now }
  }],
  subscriptionStatus: {
    type: String,
    enum: ['Active', 'Trial', 'Pending Renewal', 'Expired', 'Cancelled'],
    default: 'Active'
  },
  subscriptionBillingCycle: {
    type: String,
    enum: ['Monthly', 'Annual'],
    default: 'Monthly'
  },
  subscriptionRenewalDate: {
    type: Date
  },
  subscriptionCustomAmount: {
    type: Number
  }
});

module.exports = mongoose.model('User', UserSchema);