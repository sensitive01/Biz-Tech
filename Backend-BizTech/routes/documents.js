const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const jwt = require('jsonwebtoken');
const { cloudinary, uploadDocument } = require('../config/cloudinary');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// @route   POST /api/documents/upload
// @desc    Direct file/image upload to Cloudinary (used in Onboarding, Tenant, and Admin)
// @access  Public / Authenticated
router.post('/upload', (req, res) => {
  uploadDocument.single('file')(req, res, (err) => {
    if (err) {
      console.error('Cloudinary document upload error:', err);
      return res.status(400).json({ success: false, message: err.message || 'File upload failed' });
    }
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No document file provided.' });
      }
      // req.file.path contains the direct HTTPS Cloudinary secure URL
      const fileUrl = req.file.path;
      res.json({
        success: true,
        fileUrl: fileUrl,
        fileName: req.file.originalname || req.file.filename,
        originalName: req.file.originalname,
        publicId: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        message: 'Document stored in Cloudinary successfully'
      });
    } catch (innerErr) {
      console.error('Upload processing error:', innerErr);
      res.status(500).json({ success: false, message: innerErr.message || 'File upload failed' });
    }
  });
});

// @route   GET /api/documents
// @desc    Get all documents for the authenticated tenant
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const items = await Document.find({ tenantId: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/documents
// @desc    Create a new document with optional file upload directly to Cloudinary
// @access  Private
router.post('/', auth, (req, res) => {
  uploadDocument.single('file')(req, res, async (err) => {
    if (err) {
      console.error('Cloudinary document creation upload error:', err);
      return res.status(400).json({ success: false, message: err.message || 'File upload failed' });
    }
    try {
      const data = { ...req.body };
      if (req.file) {
        data.fileUrl = req.file.path; // Cloudinary secure URL
        data.fileName = req.file.originalname;
      }
      if (req.body.documentNumber || req.body.number) {
        data.documentNumber = (req.body.documentNumber || req.body.number).trim();
      }
      const newItem = new Document({ ...data, tenantId: req.user.id });
      const saved = await newItem.save();
      res.json(saved);
    } catch (createErr) {
      console.error('Error creating document:', createErr);
      res.status(500).json({ message: 'Server Error' });
    }
  });
});

// @route   PUT /api/documents/:id
// @desc    Update a document with optional file upload directly to Cloudinary
// @access  Private
router.put('/:id', auth, (req, res) => {
  uploadDocument.single('file')(req, res, async (err) => {
    if (err) {
      console.error('Cloudinary document update upload error:', err);
      return res.status(400).json({ success: false, message: err.message || 'File upload failed' });
    }
    try {
      const data = { ...req.body };
      if (req.file) {
        data.fileUrl = req.file.path; // Cloudinary secure URL
        data.fileName = req.file.originalname;
      }
      if (req.body.documentNumber !== undefined || req.body.number !== undefined) {
        data.documentNumber = (req.body.documentNumber || req.body.number || '').trim();
      }
      const updated = await Document.findOneAndUpdate(
        { _id: req.params.id, tenantId: req.user.id },
        { $set: data },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: 'Document not found' });
      res.json(updated);
    } catch (updateErr) {
      console.error('Error updating document:', updateErr);
      res.status(500).json({ message: 'Server Error' });
    }
  });
});

// @route   DELETE /api/documents/:id
// @desc    Delete a document and optionally clean up from Cloudinary
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findOneAndDelete({ _id: req.params.id, tenantId: req.user.id });
    if (doc && doc.fileUrl && doc.fileUrl.includes('cloudinary.com')) {
      try {
        const matches = doc.fileUrl.match(/biztech\/documents\/[^.]+/);
        if (matches && matches[0]) {
          await cloudinary.uploader.destroy(matches[0]);
        }
      } catch (cErr) {
        console.warn('Cloudinary delete warning:', cErr.message);
      }
    }
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;