const mongoose = require('mongoose');

const PaymentApprovalSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  ownerName: {
    type: String,
    default: '',
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  panNumber: {
    type: String,
    default: '',
    trim: true,
    uppercase: true
  },
  businessType: {
    type: Number,
    default: 1
  },
  planId: {
    type: String,
    default: ''
  },
  planName: {
    type: String,
    default: 'Starter Plan'
  },
  billingCycle: {
    type: String,
    enum: ['Monthly', 'Annual'],
    default: 'Monthly'
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    default: 'UPI (Admin QR)'
  },
  utrNumber: {
    type: String,
    required: true,
    trim: true
  },
  proofUrl: {
    type: String,
    required: true,
    trim: true
  },
  originalFileName: {
    type: String,
    default: ''
  },
  fileType: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  rejectionReason: {
    type: String,
    default: '',
    trim: true
  },
  reviewedBy: {
    type: String,
    default: '',
    trim: true
  },
  reviewedAt: {
    type: Date
  },
  history: [{
    action: {
      type: String,
      enum: ['Submitted', 'Approved', 'Rejected', 'Reverted'],
      default: 'Submitted'
    },
    previousStatus: {
      type: String,
      default: 'None'
    },
    newStatus: {
      type: String,
      default: 'Pending'
    },
    actor: {
      type: String,
      default: 'System'
    },
    note: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

PaymentApprovalSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('PaymentApproval', PaymentApprovalSchema);
