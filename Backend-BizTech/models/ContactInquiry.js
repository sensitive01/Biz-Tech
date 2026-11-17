const mongoose = require('mongoose');

const ContactInquirySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
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
    trim: true,
    default: '' 
  },
  company: { 
    type: String, 
    trim: true,
    default: '' 
  },
  subject: { 
    type: String, 
    trim: true,
    default: 'General Inquiry' 
  },
  message: { 
    type: String, 
    required: true,
    trim: true 
  },
  status: { 
    type: String, 
    enum: ['New', 'In Progress', 'Contacted', 'Closed'], 
    default: 'New' 
  },
  notes: { 
    type: String, 
    default: '' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('ContactInquiry', ContactInquirySchema);