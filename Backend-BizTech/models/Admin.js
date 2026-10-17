const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: 'Admin User' },
  phone: { type: String, default: '+91 98765 43210' },
  role: { type: String, default: 'Superadmin' },
  designation: { type: String, default: 'Platform Administrator' },
  department: { type: String, default: 'Operations & Management' },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Admin', AdminSchema);