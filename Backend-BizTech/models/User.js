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
  isOnboardingCompleted: {
    type: Boolean,
    default: false
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
  panNumber: {
    type: String,
    trim: true,
    uppercase: true,
    sparse: true
  },
  ownerName: {
    type: String,
    default: ''
  },
  gstNumber: {
    type: String,
    default: '',
    trim: true,
    uppercase: true
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
  offeringType: {
    type: String,
    enum: ['product', 'service', 'both', 'institution'],
    default: 'product'
  },
  businessOfferingType: {
    type: String,
    enum: ['product', 'service', 'both', 'institution'],
    default: 'product'
  },
  businesses: [{
    businessId: { type: String, trim: true },
    businessCode: { type: String, trim: true },
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
    panNumber: { type: String, trim: true, uppercase: true },
    ownerName: { type: String, default: '' },
    gstNumber: { type: String, default: '', trim: true, uppercase: true },
    offeringType: {
      type: String,
      enum: ['product', 'service', 'both', 'institution'],
      default: 'both'
    },
    operationsType: {
      type: String,
      enum: ['sales', 'purchases', 'both'],
      default: 'both'
    },
    createdAt: { type: Date, default: Date.now }
  }],
  subscriptionStatus: {
    type: String,
    enum: ['Active', 'Trial', 'Pending Renewal', 'Expired', 'Cancelled', 'Pending Approval', 'Rejected'],
    default: 'Active'
  },
  paymentProof: {
    approvalId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentApproval' },
    utrNumber: { type: String, default: '' },
    proofUrl: { type: String, default: '' },
    originalFileName: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewedBy: { type: String, default: '' },
    rejectionReason: { type: String, default: '' }
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
  },
  employeeLimit: {
    type: Number,
    default: null
  },
  branchLimit: {
    type: Number,
    default: null
  },
  businessLimit: {
    type: Number,
    default: null
  },
  category: {
    type: String,
    default: ''
  },
  subCategory: {
    type: String,
    default: ''
  },
  documents: {
    pan: { type: String, default: '' },
    gstin: { type: String, default: '' },
    msme: { type: String, default: '' },
    fssai: { type: String, default: '' },
    tradeLicense: { type: String, default: '' },
    customDocuments: [{
      name: { type: String, default: '' },
      number: { type: String, default: '' },
      fileName: { type: String, default: '' }
    }]
  },
  subscription: {
    planId: { type: String, default: '' },
    planName: { type: String, default: 'Trial' },
    amount: { type: Number, default: 0 },
    billingCycle: { type: String, default: 'Monthly' },
    paymentMethod: { type: String, default: 'Trial' },
    paymentStatus: { type: String, default: 'Active' },
    transactionId: { type: String, default: '' },
    startDate: { type: Date, default: Date.now },
    validUntil: { type: Date }
  }
});

module.exports = mongoose.model('User', UserSchema);