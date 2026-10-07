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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Pricing', PricingSchema);
