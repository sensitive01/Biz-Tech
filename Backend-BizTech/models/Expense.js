const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String },
  category: { type: String },
  description: { type: String },
  date: { type: Date },
  amount: { type: Number },
  proofUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
