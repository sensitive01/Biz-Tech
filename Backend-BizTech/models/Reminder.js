const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, default: '' },
  repeatMonthly: { type: Boolean, default: false },
  notifyBeforeDays: { type: Number, default: 0 },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reminder', ReminderSchema);