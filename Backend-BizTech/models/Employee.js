const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  position: { type: String, required: true },
  contactNumber: { type: String, default: '' },
  salary: { type: Number, default: 0 },
  dateOfJoining: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Inactive', 'On Leave'], default: 'Active' },
  shiftFrom: { type: String, default: '' },
  shiftTo: { type: String, default: '' },
  businessName: { type: String, default: '' },
  branchName: { type: String, default: '' },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }, // Optional, will be set for type 3
  tenantId: { type: String, default: 'default_tenant' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Employee', employeeSchema);