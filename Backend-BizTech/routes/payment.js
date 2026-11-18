const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Razorpay = require('razorpay');
const Admin = require('../models/Admin');

// Ensure payment proof uploads directory exists
const proofUploadDir = path.join(__dirname, '../uploads/payment-proofs');
if (!fs.existsSync(proofUploadDir)) {
  fs.mkdirSync(proofUploadDir, { recursive: true });
}

// Multer Storage for Payment Proofs
const proofStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, proofUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `proof_${cleanBase}_${uniqueSuffix}${ext}`);
  }
});

const uploadProof = multer({
  storage: proofStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|pdf/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const mime = file.mimetype;
    if (allowed.test(ext) || allowed.test(mime)) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPG, PNG, WEBP) and PDF files are allowed.'));
  }
});

// Initialize Razorpay instance
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_U18JZ6gYj3ozhP';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'P1KzOd1Z25YXadyjTUdJMWPi';
  return new Razorpay({ key_id, key_secret });
};

// @route   GET /api/payment/config
// @desc    Get active payment configurations for tenant onboarding (Admin UPI ID & Razorpay Public Key)
// @access  Public
router.get('/config', async (req, res) => {
  try {
    let upiId = 'biztech@upi';
    const admin = await Admin.findOne().sort({ createdAt: 1 });
    if (admin && admin.upiId) {
      upiId = admin.upiId;
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_U18JZ6gYj3ozhP';

    res.json({
      success: true,
      upiId,
      razorpayKeyId,
      currency: 'INR'
    });
  } catch (err) {
    console.error('Error fetching payment config:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment configuration',
      upiId: 'biztech@upi',
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_U18JZ6gYj3ozhP'
    });
  }
});

// @route   POST /api/payment/create-order
// @desc    Create Razorpay Order for tenant onboarding or subscription renewal
// @access  Public
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required' });
    }

    const rzp = getRazorpayInstance();
    const amountInPaise = Math.round(Number(amount) * 100);

    const orderOptions = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || { description: 'BizTech Workspace Activation' }
    };

    const order = await rzp.orders.create(orderOptions);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_U18JZ6gYj3ozhP',
      order
    });
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to initiate Razorpay order'
    });
  }
});

// @route   POST /api/payment/verify
// @desc    Verify Razorpay payment signature
// @access  Public
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Incomplete payment signature credentials' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'P1KzOd1Z25YXadyjTUdJMWPi';
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      res.json({
        success: true,
        message: 'Razorpay payment successfully verified',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid payment signature verification failed'
      });
    }
  } catch (err) {
    console.error('Signature verification error:', err);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
});

// @route   POST /api/payment/upload-proof
// @desc    Upload screenshot or receipt proof for UPI QR payment
// @access  Public
router.post('/upload-proof', uploadProof.single('proof'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No proof file provided. Please upload an image or PDF.' });
    }

    const relativeUrl = `/uploads/payment-proofs/${req.file.filename}`;
    res.json({
      success: true,
      fileUrl: relativeUrl,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      message: 'Payment proof uploaded successfully'
    });
  } catch (err) {
    console.error('Upload proof error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to upload payment proof' });
  }
});

module.exports = router;
