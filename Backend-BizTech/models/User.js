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
    regNo: String,
    phone: String,
    address: String
  }]
});

module.exports = mongoose.model('User', UserSchema);