const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const PaymentApproval = require('../models/PaymentApproval');
const User = require('../models/User');
const { calculatePlanExpiry } = require('../utils/subscriptionHelper');
const Admin = require('../models/Admin');

// Middleware to verify Admin JWT
const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    let admin = null;
    if (decoded && decoded.admin && decoded.admin.id) {
      admin = await Admin.findById(decoded.admin.id);
    }
    if (!admin) {
      admin = await Admin.findOne({ email: 'admin@biztech.com' });
    }

    req.admin = admin || { name: 'Admin', role: 'Superadmin' };
    next();
  } catch (err) {
    console.error('Admin auth error:', err.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired admin token' });
  }
};

// @route   GET /api/admin/payment-approvals/counts
// @desc    Get summary counts of payment approvals for sidebar badges & stats
// @access  Admin
router.get('/counts', verifyAdmin, async (req, res) => {
  try {
    const [all, pending, approved, rejected] = await Promise.all([
      PaymentApproval.countDocuments(),
      PaymentApproval.countDocuments({ status: 'Pending' }),
      PaymentApproval.countDocuments({ status: 'Approved' }),
      PaymentApproval.countDocuments({ status: 'Rejected' })
    ]);

    res.json({
      success: true,
      counts: { all, pending, approved, rejected }
    });
  } catch (err) {
    console.error('Error fetching approval counts:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/admin/payment-approvals
// @desc    List all payment approval requests with status filter & search
// @access  Admin
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;

    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { businessName: regex },
        { ownerName: regex },
        { email: regex },
        { phone: regex },
        { utrNumber: regex },
        { panNumber: regex },
        { planName: regex }
      ];
    }

    const [approvals, all, pending, approved, rejected] = await Promise.all([
      PaymentApproval.find(filter).sort({ createdAt: -1 }),
      PaymentApproval.countDocuments(),
      PaymentApproval.countDocuments({ status: 'Pending' }),
      PaymentApproval.countDocuments({ status: 'Approved' }),
      PaymentApproval.countDocuments({ status: 'Rejected' })
    ]);

    res.json({
      success: true,
      approvals,
      counts: {
        all,
        pending,
        approved,
        rejected
      }
    });
  } catch (err) {
    console.error('Error listing payment approvals:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/payment-approvals/:id/approve
// @desc    Approve a payment proof request and unlock tenant workspace
// @access  Admin
router.post('/:id/approve', verifyAdmin, async (req, res) => {
  try {
    const approval = await PaymentApproval.findById(req.params.id);
    if (!approval) {
      return res.status(404).json({ success: false, message: 'Approval request not found' });
    }

    const previousStatus = approval.status;
    const adminName = req.admin?.name || 'Admin User';

    approval.status = 'Approved';
    approval.reviewedBy = adminName;
    approval.reviewedAt = new Date();
    approval.rejectionReason = '';

    approval.history.push({
      action: 'Approved',
      previousStatus,
      newStatus: 'Approved',
      actor: adminName,
      note: 'Payment proof verified and workspace unlocked',
      timestamp: new Date()
    });

    await approval.save();

    // Update corresponding User record
    if (approval.tenantId) {
      const user = await User.findById(approval.tenantId);
      if (user) {
        user.subscriptionStatus = 'Active';
        user.isOnboardingCompleted = true;

        const isAnnual = (approval.billingCycle || '').toLowerCase() === 'annual' || (approval.billingCycle || '').toLowerCase() === 'yearly';
        const now = new Date();
        const validUntil = calculatePlanExpiry(approval.billingCycle, now);

        if (!user.subscription) user.subscription = {};
        user.subscription.paymentStatus = 'Active';
        user.subscription.planId = approval.planId || user.subscription.planId;
        user.subscription.planName = approval.planName || user.subscription.planName;
        user.subscription.amount = approval.amount;
        user.subscription.billingCycle = isAnnual ? 'Annual' : 'Monthly';
        user.subscription.paymentMethod = approval.paymentMethod || 'UPI (Admin QR)';
        user.subscription.transactionId = approval.utrNumber;
        user.subscription.startDate = now;
        user.subscription.validUntil = validUntil;
        user.subscriptionRenewalDate = validUntil;
        user.subscriptionBillingCycle = isAnnual ? 'Annual' : 'Monthly';

        if (!user.paymentProof) user.paymentProof = {};
        user.paymentProof.status = 'Approved';
        user.paymentProof.reviewedBy = adminName;
        user.paymentProof.reviewedAt = now;
        user.paymentProof.rejectionReason = '';

        await user.save();
      }
    }

    res.json({
      success: true,
      message: `Payment for "${approval.businessName}" approved! Tenant workspace is now unlocked.`,
      approval
    });
  } catch (err) {
    console.error('Error approving payment:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/payment-approvals/:id/reject
// @desc    Reject a payment proof request with optional reason
// @access  Admin
router.post('/:id/reject', verifyAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const approval = await PaymentApproval.findById(req.params.id);
    if (!approval) {
      return res.status(404).json({ success: false, message: 'Approval request not found' });
    }

    const previousStatus = approval.status;
    const adminName = req.admin?.name || 'Admin User';
    const rejectReason = (reason || '').trim() || 'Payment receipt screenshot or UTR number could not be verified.';

    approval.status = 'Rejected';
    approval.rejectionReason = rejectReason;
    approval.reviewedBy = adminName;
    approval.reviewedAt = new Date();

    approval.history.push({
      action: 'Rejected',
      previousStatus,
      newStatus: 'Rejected',
      actor: adminName,
      note: `Rejected with reason: ${rejectReason}`,
      timestamp: new Date()
    });

    await approval.save();

    // Update corresponding User record
    if (approval.tenantId) {
      const user = await User.findById(approval.tenantId);
      if (user) {
        user.subscriptionStatus = 'Rejected';

        if (!user.subscription) user.subscription = {};
        user.subscription.paymentStatus = 'Rejected';

        if (!user.paymentProof) user.paymentProof = {};
        user.paymentProof.status = 'Rejected';
        user.paymentProof.rejectionReason = rejectReason;
        user.paymentProof.reviewedBy = adminName;
        user.paymentProof.reviewedAt = new Date();

        await user.save();
      }
    }

    res.json({
      success: true,
      message: `Payment request for "${approval.businessName}" rejected.`,
      approval
    });
  } catch (err) {
    console.error('Error rejecting payment:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/payment-approvals/:id/undo
// @desc    Undo approval or rejection decision - reverts status back to Pending
// @access  Admin
router.post('/:id/undo', verifyAdmin, async (req, res) => {
  try {
    const approval = await PaymentApproval.findById(req.params.id);
    if (!approval) {
      return res.status(404).json({ success: false, message: 'Approval request not found' });
    }

    const previousStatus = approval.status;
    const adminName = req.admin?.name || 'Admin User';

    approval.status = 'Pending';
    approval.rejectionReason = '';
    approval.reviewedBy = adminName;
    approval.reviewedAt = new Date();

    approval.history.push({
      action: 'Reverted',
      previousStatus,
      newStatus: 'Pending',
      actor: adminName,
      note: `Admin reverted decision from "${previousStatus}" back to "Pending"`,
      timestamp: new Date()
    });

    await approval.save();

    // Revert user record back to Pending Approval
    if (approval.tenantId) {
      const user = await User.findById(approval.tenantId);
      if (user) {
        user.subscriptionStatus = 'Pending Approval';

        if (!user.subscription) user.subscription = {};
        user.subscription.paymentStatus = 'Pending Approval';

        if (!user.paymentProof) user.paymentProof = {};
        user.paymentProof.status = 'Pending';
        user.paymentProof.rejectionReason = '';
        user.paymentProof.reviewedBy = adminName;
        user.paymentProof.reviewedAt = new Date();

        await user.save();
      }
    }

    res.json({
      success: true,
      message: `Decision undone. Payment request for "${approval.businessName}" has been reverted to Pending review.`,
      approval
    });
  } catch (err) {
    console.error('Error undoing payment decision:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
