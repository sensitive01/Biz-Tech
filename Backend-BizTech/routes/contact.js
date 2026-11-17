const express = require('express');
const router = express.Router();
const ContactInquiry = require('../models/ContactInquiry');

// @route   POST /api/contact (or /api/admin/contact-inquiries)
// @desc    Submit a contact inquiry from public landing page
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, subject, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Work email is required' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const newInquiry = new ContactInquiry({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || '').trim(),
      company: (company || '').trim(),
      subject: (subject || 'General Inquiry').trim(),
      message: message.trim(),
      status: 'New'
    });

    const saved = await newInquiry.save();
    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! We will contact you soon.',
      inquiry: saved
    });
  } catch (err) {
    console.error('Contact submit error:', err);
    res.status(500).json({ error: 'Server error while submitting your inquiry' });
  }
});

// @route   GET /api/admin/contact-inquiries (and /api/contact)
// @desc    Get all inquiries with filtering & stats for Admin
router.get('/', async (req, res) => {
  try {
    const { status, search, limit = 500 } = req.query;
    const filter = {};

    if (status && status !== 'all' && status !== 'All Statuses') {
      filter.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { company: regex },
        { subject: regex },
        { message: regex }
      ];
    }

    const [inquiries, counts] = await Promise.all([
      ContactInquiry.find(filter).sort({ createdAt: -1 }).limit(Number(limit)),
      Promise.all([
        ContactInquiry.countDocuments(),
        ContactInquiry.countDocuments({ status: 'New' }),
        ContactInquiry.countDocuments({ status: 'In Progress' }),
        ContactInquiry.countDocuments({ status: 'Contacted' }),
        ContactInquiry.countDocuments({ status: 'Closed' })
      ])
    ]);

    res.json({
      inquiries,
      stats: {
        total: counts[0],
        new: counts[1],
        inProgress: counts[2],
        contacted: counts[3],
        closed: counts[4]
      }
    });
  } catch (err) {
    console.error('Fetch inquiries error:', err);
    res.status(500).json({ error: 'Server error while fetching inquiries' });
  }
});

// @route   GET /api/admin/contact-inquiries/:id
// @desc    Get single inquiry details
router.get('/:id', async (req, res) => {
  try {
    const inquiry = await ContactInquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    res.json(inquiry);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/admin/contact-inquiries/:id
// @desc    Update inquiry status or admin notes
router.put('/:id', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updates = {};

    if (status) {
      const validStatuses = ['New', 'In Progress', 'Contacted', 'Closed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }
      updates.status = status;
    }

    if (notes !== undefined) {
      updates.notes = notes;
    }

    const updated = await ContactInquiry.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    res.json({
      success: true,
      message: 'Inquiry updated successfully',
      inquiry: updated
    });
  } catch (err) {
    console.error('Update inquiry error:', err);
    res.status(500).json({ error: 'Server error while updating inquiry' });
  }
});

// @route   DELETE /api/admin/contact-inquiries/:id
// @desc    Delete inquiry
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await ContactInquiry.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (err) {
    console.error('Delete inquiry error:', err);
    res.status(500).json({ error: 'Server error while deleting inquiry' });
  }
});

module.exports = router;