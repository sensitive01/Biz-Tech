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
    required: true,
    unique: true,
    sparse: true,
    trim: true
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
  businessLogo: {
    type: String,
    default: ''
  },
  industry: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  streetAddress: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  pincode: {
    type: String,
    default: ''
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
    categories: [{ type: String }],
    contactPerson: { type: String, default: '' },
    taxNumber: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    streetAddress: { type: String, default: '' },
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
  categories: [{
    type: String
  }],
  subCategory: {
    type: String,
    default: ''
  },
  catalogueData: {
    type: Array,
    default: []
  },
  documents: {
    pan: { type: String, default: '' },
    panType: { type: String, default: 'ID Card' },
    panExpiryDate: { type: Date },
    panFileUrl: { type: String, default: '' },
    panFileName: { type: String, default: '' },
    gstin: { type: String, default: '' },
    gstinType: { type: String, default: 'Certificate' },
    gstinExpiryDate: { type: Date },
    gstinFileUrl: { type: String, default: '' },
    gstinFileName: { type: String, default: '' },
    msme: { type: String, default: '' },
    msmeType: { type: String, default: 'Registration' },
    msmeExpiryDate: { type: Date },
    msmeFileUrl: { type: String, default: '' },
    msmeFileName: { type: String, default: '' },
    fssai: { type: String, default: '' },
    fssaiType: { type: String, default: 'License' },
    fssaiExpiryDate: { type: Date },
    fssaiFileUrl: { type: String, default: '' },
    fssaiFileName: { type: String, default: '' },
    tradeLicense: { type: String, default: '' },
    customDocuments: [{
      name: { type: String, default: '' },
      type: { type: String, default: 'Registration' },
      number: { type: String, default: '' },
      fileUrl: { type: String, default: '' },
      fileName: { type: String, default: '' },
      expiryDate: { type: Date }
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