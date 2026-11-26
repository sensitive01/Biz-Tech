const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Razorpay = require('razorpay');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const PaymentApproval = require('../models/PaymentApproval');
const { uploadPaymentProof } = require('../config/cloudinary');

// Auth middleware for authenticated tenants
const authTenant = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No authorization token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authorization token' });
  }
};

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
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_U2JoYZ0nibt5sL';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'lVMdPV8NkpRzg2v9BoDqf4JK';
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

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_U2JoYZ0nibt5sL';

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
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_U2JoYZ0nibt5sL'
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
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_U2JoYZ0nibt5sL',
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

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'lVMdPV8NkpRzg2v9BoDqf4JK';
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
// @desc    Upload screenshot or receipt proof for UPI QR payment directly to Cloudinary
// @access  Public
router.post('/upload-proof', (req, res) => {
  uploadPaymentProof.single('proof')(req, res, (err) => {
    if (err) {
      console.error('Payment proof upload error:', err);
      return res.status(400).json({ success: false, message: err.message || 'Failed to upload payment proof' });
    }
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No proof file provided. Please upload an image or PDF.' });
      }

      // req.file.path contains the direct Cloudinary secure HTTPS URL
      const fileUrl = req.file.path;
      res.json({
        success: true,
        fileUrl: fileUrl,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        message: 'Payment proof stored in Cloudinary successfully'
      });
    } catch (routeErr) {
      console.error('Upload proof error:', routeErr);
      res.status(500).json({ success: false, message: routeErr.message || 'Failed to upload payment proof' });
    }
  });
});

// @route   GET /api/payment/my-subscriptions
// @desc    Get real paid subscription history and live subscription summary for the logged-in tenant
// @access  Authenticated Tenant
router.get('/my-subscriptions', authTenant, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Tenant workspace account not found' });
    }

    // Retrieve all payment approvals registered for this tenant (by ID or Email)
    let approvals = await PaymentApproval.find({
      $or: [
        { tenantId: user._id },
        { email: user.email }
      ]
    }).sort({ createdAt: -1 });

    // Auto-backfill: if user has a verified/active subscription payment with transaction ID or amount > 0
    // and no PaymentApproval record exists for it, persist it to keep an authentic audit trail
    if (user.subscription && (Number(user.subscription.amount) > 0 || user.subscription.transactionId)) {
      const txnId = user.subscription.transactionId || `TXN-${String(user._id).slice(-6).toUpperCase()}`;
      const alreadyLogged = approvals.some(a => a.utrNumber === txnId || (a.planName === user.subscription.planName && Math.abs(a.amount - user.subscription.amount) < 1));
      
      if (!alreadyLogged) {
        try {
          const subDate = user.subscription.startDate || user.createdAt || new Date();
          const autoApproval = new PaymentApproval({
            tenantId: user._id,
            businessName: user.businessName || 'My Workspace',
            ownerName: user.ownerName || user.fullName || 'Tenant Owner',
            email: user.email,
            phone: user.businessPhone || user.phone || '',
            panNumber: user.panNumber || '',
            businessType: user.businessType || 1,
            planId: user.subscription.planId || '',
            planName: user.subscription.planName || 'Standard Plan',
            billingCycle: user.subscription.billingCycle || 'Monthly',
            amount: Number(user.subscription.amount) || 0,
            paymentMethod: user.subscription.paymentMethod || 'Razorpay',
            utrNumber: txnId,
            proofUrl: user.paymentProof?.proofUrl || '',
            originalFileName: user.paymentProof?.originalFileName || '',
            status: 'Approved',
            reviewedBy: 'System (Verified Payment)',
            reviewedAt: subDate,
            history: [{
              action: 'Approved',
              previousStatus: 'None',
              newStatus: 'Approved',
              actor: 'Payment Gateway',
              note: `Payment verified via ${user.subscription.paymentMethod || 'Razorpay'} (${txnId})`,
              timestamp: subDate
            }],
            createdAt: subDate,
            updatedAt: subDate
          });
          await autoApproval.save();
          approvals.unshift(autoApproval);
        } catch (autoErr) {
          console.warn('Note: Auto approval sync skipped:', autoErr.message);
        }
      }
    }

    // Format real invoices
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let invoices = approvals.map((app, index) => {
      const isApproved = app.status === 'Approved';
      const createdDate = new Date(app.createdAt || Date.now());
      const year = createdDate.getFullYear();
      const monthIdx = createdDate.getMonth();
      const monthNum = String(monthIdx + 1).padStart(2, '0');
      const code = app._id ? String(app._id).slice(-4).toUpperCase() : String(index + 1).padStart(4, '0');
      const invoiceId = `INV-${year}-${monthNum}-${code}`;

      let period = `${monthNames[monthIdx]} ${year}`;
      const cycleLower = String(app.billingCycle || '').toLowerCase();
      if (cycleLower === 'annual' || cycleLower === 'yearly') {
        const endYear = year + 1;
        period = `${shortMonths[monthIdx]} ${year} - ${shortMonths[monthIdx]} ${endYear}`;
      }

      const formattedDate = createdDate.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });

      return {
        _id: app._id,
        id: invoiceId,
        invoiceNumber: invoiceId,
        period: period,
        date: formattedDate,
        rawDate: app.createdAt,
        plan: app.planName || user.subscription?.planName || 'Standard Plan',
        amount: `₹${Number(app.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        rawAmount: Number(app.amount || 0),
        method: app.paymentMethod || 'Online Payment',
        status: isApproved ? 'Paid' : (app.status || 'Pending'),
        transactionId: app.utrNumber || (app._id ? `TXN-${String(app._id).slice(-8).toUpperCase()}` : 'N/A'),
        proofUrl: app.proofUrl || '',
        billingCycle: app.billingCycle || 'Monthly',
        reviewedBy: app.reviewedBy || '',
        reviewedAt: app.reviewedAt,
        rejectionReason: app.rejectionReason || ''
      };
    });

    // Fallback: If no invoice document was registered yet but tenant has an active plan payment,
    // guarantee at least one real invoice so the table is never empty
    if (invoices.length === 0 && user.subscription && (Number(user.subscription.amount) > 0 || user.subscription.transactionId)) {
      const subDate = new Date(user.subscription.startDate || user.createdAt || Date.now());
      const year = subDate.getFullYear();
      const monthIdx = subDate.getMonth();
      const monthNum = String(monthIdx + 1).padStart(2, '0');
      const code = String(user._id).slice(-4).toUpperCase();
      const invoiceId = `INV-${year}-${monthNum}-${code}`;
      const cycleLower = String(user.subscription.billingCycle || '').toLowerCase();
      let period = `${monthNames[monthIdx]} ${year}`;
      if (cycleLower === 'annual' || cycleLower === 'yearly') {
        period = `${shortMonths[monthIdx]} ${year} - ${shortMonths[monthIdx]} ${year + 1}`;
      }
      invoices.push({
        _id: 'active-sub-' + user._id,
        id: invoiceId,
        invoiceNumber: invoiceId,
        period: period,
        date: subDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        rawDate: subDate,
        plan: user.subscription.planName || 'Active Plan',
        amount: `₹${Number(user.subscription.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        rawAmount: Number(user.subscription.amount || 0),
        method: user.subscription.paymentMethod || 'Razorpay',
        status: 'Paid',
        transactionId: user.subscription.transactionId || `TXN-${String(user._id).slice(-8).toUpperCase()}`,
        proofUrl: '',
        billingCycle: user.subscription.billingCycle || 'Monthly',
        reviewedBy: 'Payment Gateway',
        rejectionReason: ''
      });
    }

    // Summary calculations
    const approvedInvoices = invoices.filter(i => i.status === 'Paid');
    const totalPaid = approvedInvoices.reduce((sum, i) => sum + (i.rawAmount || 0), 0);
    const paidCount = approvedInvoices.length;

    const currentPlanName = user.subscription?.planName || 'Standard Plan';
    const subStatus = user.subscriptionStatus || (user.subscription?.paymentStatus === 'Active' ? 'Active' : 'Trial');
    const cycle = user.subscriptionBillingCycle || user.subscription?.billingCycle || 'Monthly';
    
    const rateAmount = user.subscriptionCustomAmount !== undefined && user.subscriptionCustomAmount !== null
      ? user.subscriptionCustomAmount
      : (user.subscription?.amount || 0);

    const isAnnual = cycle.toLowerCase() === 'annual' || cycle.toLowerCase() === 'yearly';
    const rateFormatted = `₹${Number(rateAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} / ${isAnnual ? 'yr' : 'mo'}`;

    let nextDueDateStr = 'N/A';
    const renewalDate = user.subscriptionRenewalDate || user.subscription?.validUntil;
    if (renewalDate) {
      const d = new Date(renewalDate);
      if (!isNaN(d.getTime())) {
        nextDueDateStr = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      }
    }

    res.json({
      success: true,
      summary: {
        currentPlan: currentPlanName,
        status: subStatus,
        monthlyRate: rateFormatted,
        billingCycle: cycle,
        autoBilledNote: isAnnual ? 'Auto-billed annually' : 'Auto-billed on 1st of month',
        totalPaidFormatted: `₹${Number(totalPaid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        totalPaidRaw: totalPaid,
        paidInvoicesNote: `${paidCount} ${paidCount === 1 ? 'Paid Invoice' : 'Paid Invoices'}`,
        nextDueDate: nextDueDateStr,
        nextDueAmountFormatted: `₹${Number(rateAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
      },
      history: invoices
    });
  } catch (err) {
    console.error('Error fetching tenant subscriptions:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to retrieve payment history' });
  }
});

module.exports = router;