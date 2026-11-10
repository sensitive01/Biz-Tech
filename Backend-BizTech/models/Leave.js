const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  category: { type: String, enum: ['Leave', 'Permission'], default: 'Leave' },
  type: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  timeFrom: { type: String, default: '' },
  timeTo: { type: String, default: '' },
  durationHours: { type: String, default: '' },
  reason: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  appliedByRole: { type: String, enum: ['employee', 'owner', 'manager', 'admin'], default: 'owner' },
  appliedBy: { type: String, default: '' },
  reviewedBy: { type: String, default: '' },
  reviewNote: { type: String, default: '' },
  reviewedAt: { type: Date },
  tenantId: { type: String, default: 'default_tenant' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Leave', leaveSchema);
