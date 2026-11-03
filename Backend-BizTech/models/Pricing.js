const mongoose = require('mongoose');

const PricingSchema = new mongoose.Schema({
  customerType: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  description: {
    type: String,
    default: ''
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Pricing', PricingSchema);