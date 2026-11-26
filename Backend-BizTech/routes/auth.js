const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Branch = require('../models/Branch');
const Employee = require('../models/Employee');
const Investor = require('../models/Investor');
const Pricing = require('../models/Pricing');
const PaymentApproval = require('../models/PaymentApproval');
const Document = require('../models/Document');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');
const { seedCatalogueFromUser } = require('../utils/catalogueSeeder');
const { checkEmailInUse } = require('../utils/emailValidator');
const { checkPhoneInUse } = require('../utils/phoneValidator');
const { isSubscriptionExpired, calculatePlanExpiry, formatDateString } = require('../utils/subscriptionHelper');

// Helper to generate a unique human-readable tenant ID
const generateUserId = async () => {
  const count = await User.countDocuments();
  let candidate = `BT-${1000 + count + 1}`;
  let exists = await User.findOne({ userId: candidate });
  while (exists) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    candidate = `BT-${randomSuffix}`;
    exists = await User.findOne({ userId: candidate });
  }
  return candidate;
};

// @route   POST /api/auth/check-email
// @desc    Check if email already exists before step 2
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }
    const check = await checkEmailInUse(email);
    if (check.taken) {
      return res.status(400).json({ message: check.message });
    }
    res.status(200).json({ message: 'Email is available' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/auth/check-phone
// @desc    Check if phone number already exists
// @access  Public
router.post('/check-phone', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit phone number.' });
    }
    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
    }
    const check = await checkPhoneInUse(cleanPhone);
    if (check.taken) {
      return res.status(400).json({ message: check.message, taken: true });
    }
    res.status(200).json({ message: 'Phone number is available', available: true });
  } catch (err) {
    console.error('Check phone error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   ALL /api/auth/check-pan
// @desc    Check if a PAN card number already exists in any business
// @access  Public
router.all('/check-pan', async (req, res) => {
  try {
    const rawPan = req.method === 'GET' ? req.query.pan : req.body.pan;
    if (!rawPan || !String(rawPan).trim()) {
      return res.status(400).json({ success: false, message: 'PAN card number is required.' });
    }

    const pan = String(rawPan).trim().toUpperCase();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(pan)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid PAN format. Must be 10 characters (5 capital letters, 4 digits, 1 capital letter, e.g. ABCDE1234F).' 
      });
    }

    // Exclude current user if token is present
    let currentUserId = null;
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        if (decoded && decoded.user) {
          currentUserId = decoded.user.id;
        }
      } catch (e) {}
    }

    const query = {
      $or: [
        { panNumber: pan },
        { 'documents.pan': pan },
        { 'businesses.panNumber': pan }
      ]
    };

    if (currentUserId) {
      query._id = { $ne: currentUserId };
    }

    const existing = await User.findOne(query);

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        exists: true, 
        message: `This PAN Card Number (${pan}) is already registered with another business. Please use a unique PAN.` 
      });
    }

    return res.status(200).json({ 
      success: true, 
      exists: false, 
      message: 'PAN is available and unique.' 
    });
  } catch (err) {
    console.error('Check PAN error:', err);
    res.status(500).json({ success: false, message: 'Server error checking PAN availability.' });
  }
});

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { 
      fullName, email, phone, password, businessType, businessName, 
      industry, address, offeringType, businessOfferingType, modules, operationsType 
    } = req.body;

    // Check if email already in use across any account tier (Owner, Business, Branch, Employee, Investor)
    const check = await checkEmailInUse(email);
    if (check.taken) {
      return res.status(400).json({ message: check.message });
    }

    // Check if phone number already in use across any account tier (Owner, Business, Branch, Employee, Investor)
    const cleanPhone = (phone || '').trim().replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit phone number.' });
    }
    const phoneCheck = await checkPhoneInUse(cleanPhone);
    if (phoneCheck.taken) {
      return res.status(400).json({ message: phoneCheck.message });
    }

    // Auto-apply preset employee, branch, and business limits from pricing plan
    const targetTypeNum = Number(businessType) || 1;
    let initialEmployeeLimit = null;
    let initialBranchLimit = null;
    let initialBusinessLimit = null;
    const plan = await Pricing.findOne({ customerType: { $regex: new RegExp('Type ' + targetTypeNum, 'i') } });
    if (plan) {
      if (plan.employeeLimit !== undefined && plan.employeeLimit !== null) initialEmployeeLimit = plan.employeeLimit;
      if (plan.branchLimit !== undefined && plan.branchLimit !== null) initialBranchLimit = plan.branchLimit;
      if (plan.businessLimit !== undefined && plan.businessLimit !== null) initialBusinessLimit = plan.businessLimit;
    }
    if (initialEmployeeLimit === null && (targetTypeNum === 1 || targetTypeNum === 2 || targetTypeNum === 3)) {
      initialEmployeeLimit = 10;
    }
    if (initialBranchLimit === null && targetTypeNum === 3) {
      initialBranchLimit = 5;
    }
    if (targetTypeNum === 4) {
      if (initialBranchLimit === null) initialBranchLimit = 10;
      if (initialBusinessLimit === null) initialBusinessLimit = 3;
    }

    const resolvedOffering = offeringType || businessOfferingType || 'product';

    // Create new user with unique ID
    const userId = await generateUserId();
    const targetIndustry = req.body.category || industry || '';
    const targetCategories = req.body.categories || (req.body.category ? [req.body.category] : (industry ? [industry] : []));
    const targetSubCategory = req.body.subCategory || '';

    user = new User({
      fullName,
      email,
      phone: cleanPhone,
      password,
      userId,
      businessType: targetTypeNum,
      businessName,
      industry: targetIndustry,
      category: targetIndustry,
      categories: targetCategories,
      subCategory: targetSubCategory,
      address,
      offeringType: resolvedOffering,
      businessOfferingType: resolvedOffering,
      modules: (modules && Array.isArray(modules) && modules.length > 0)
        ? Array.from(new Set([...modules, 'sales']))
        : ['sales', 'products_services', 'expenses', ...(resolvedOffering !== 'service' ? ['inventory'] : []), ...(operationsType !== 'billing_only' ? ['purchases'] : [])],
      employeeLimit: initialEmployeeLimit,
      branchLimit: initialBranchLimit,
      businessLimit: initialBusinessLimit
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Auto-seed catalogue categories and subcategories
    try {
      await seedCatalogueFromUser(user._id, req.body.catalogueData);
    } catch (seedErr) {
      console.error('Error auto-seeding catalogue during register:', seedErr);
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        businessType: user.businessType
      }
    };

      // Sign Token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ 
          token, 
          user: { 
            id: user.id, 
            userId: user.userId,
            fullName, 
            email, 
            businessType: user.businessType, 
            modules: user.modules 
          } 
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user, business, branch, employee, or investor via email or phone & get token
router.post('/login', async (req, res) => {
  try {
    const { email, phone, username, password } = req.body;
    const identifier = (email || phone || username || '').trim();
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please provide email or phone number and password' });
    }

    const cleanEmail = identifier.toLowerCase();
    const cleanPhone = identifier.replace(/[^0-9]/g, '');
    const isPhone = cleanPhone.length >= 10;

    // 1. Check if user exists (Owner Account by email or phone)
    const ownerConditions = [{ email: cleanEmail }];
    if (isPhone) {
      ownerConditions.push({ phone: cleanPhone });
    }
    let user = await User.findOne({ $or: ownerConditions });
    if (user) {
      // Validate password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid Credentials' });
      }

      // Check Subscription Approval Status
      if (user.subscriptionStatus === 'Pending Approval') {
        return res.status(403).json({
          message: 'Your payment verification is pending admin approval. You will get access once verified by the platform admin.',
          isPendingApproval: true,
          subscriptionStatus: 'Pending Approval',
          approvalDetails: {
            businessName: user.businessName || '',
            planName: user.subscription?.planName || 'Selected Plan',
            amount: user.subscription?.amount || 0,
            billingCycle: user.subscription?.billingCycle || 'Monthly',
            utrNumber: user.paymentProof?.utrNumber || user.subscription?.transactionId || '',
            submittedAt: user.paymentProof?.submittedAt || user.updatedAt,
            proofUrl: user.paymentProof?.proofUrl || ''
          }
        });
      }

      if (user.subscriptionStatus === 'Rejected') {
        return res.status(403).json({
          message: user.paymentProof?.rejectionReason 
            ? `Your payment verification was rejected: ${user.paymentProof.rejectionReason}. Please contact support or re-submit proof.` 
            : 'Your payment verification was rejected by admin. Please contact support.',
          isRejected: true,
          subscriptionStatus: 'Rejected',
          rejectionReason: user.paymentProof?.rejectionReason || ''
        });
      }

      // Check Subscription Expiry Status (Monthly 30 days / Annual 365 days)
      if (isSubscriptionExpired(user)) {
        const expiryDateStr = formatDateString(user.subscription?.validUntil || user.subscriptionRenewalDate);
        return res.status(403).json({
          message: `Your subscription plan (${user.subscription?.planName || 'Plan'}) expired on ${expiryDateStr}. Please repurchase or renew your plan to continue accessing your workspace.`,
          isExpired: true,
          subscriptionStatus: 'Expired',
          expiredPlan: {
            planId: user.subscription?.planId || '',
            planName: user.subscription?.planName || 'Standard Plan',
            amount: user.subscription?.amount || 0,
            billingCycle: user.subscription?.billingCycle || user.subscriptionBillingCycle || 'Monthly',
            validUntil: user.subscription?.validUntil || user.subscriptionRenewalDate,
            expiryFormatted: expiryDateStr,
            businessType: user.businessType || 1,
            businessName: user.businessName || '',
            email: user.email,
            phone: user.phone
          }
        });
      }

      // Ensure existing user has uniqueId
      if (!user.userId) {
        user.userId = user.get('uniqueId') || await generateUserId();
        await user.save();
      }

      // Create JWT payload
      const payload = {
        user: {
          id: user.id,
          businessType: user.businessType,
          role: 'owner'
        }
      };

      // Sign Token
      return jwt.sign(
        payload,
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '1d' },
        (err, token) => {
          if (err) throw err;
          const isCompleted = user.isOnboardingCompleted === true || (Boolean(user.businessName) && Boolean(user.panNumber) && Boolean(user.subscription?.planId));

          res.json({ 
            token, 
            requiresOnboarding: !isCompleted,
            user: { 
              id: user.id, 
              userId: user.userId,
              fullName: user.fullName, 
              ownerName: user.ownerName || user.fullName,
              email: user.email, 
              phone: user.phone,
              role: 'owner',
              businessType: user.businessType, 
              businessName: user.businessName,
              panNumber: user.panNumber,
              gstNumber: user.gstNumber,
              address: user.address,
              streetAddress: user.streetAddress || user.businesses?.[0]?.streetAddress || '',
              city: user.city || user.businesses?.[0]?.city || '',
              state: user.state || user.businesses?.[0]?.state || '',
              pincode: user.pincode || user.businesses?.[0]?.pincode || '',
              isOnboardingCompleted: isCompleted,
              subscriptionStatus: user.subscriptionStatus,
              subscription: user.subscription,
              offeringType: user.offeringType,
              businessOfferingType: user.businessOfferingType || user.offeringType,
              category: user.category,
              categories: user.categories,
              subCategory: user.subCategory,
              documents: user.documents,
              businesses: (user.businesses || []).map(b => {
                const obj = b.toObject ? b.toObject() : { ...b };
                delete obj.password;
                obj.hasPassword = Boolean(b.password);
                return obj;
              }),
              modules: user.modules 
            } 
          });
        }
      );
    }

    // 2. Check if a Business exists with this email or phone (Business Login)
    const bizConditions = [{ 'businesses.email': cleanEmail }];
    if (isPhone) {
      bizConditions.push({ 'businesses.phone': cleanPhone });
    }
    const parentUserWithBiz = await User.findOne({ $or: bizConditions });
    if (parentUserWithBiz) {
      const business = parentUserWithBiz.businesses.find(b => 
        (b.email && b.email.toLowerCase() === cleanEmail) ||
        (isPhone && b.phone && b.phone.replace(/[^0-9]/g, '') === cleanPhone)
      );
      if (business && business.password) {
        if (business.isLoginEnabled === false) {
          return res.status(403).json({ message: 'Login access for this business is currently disabled by the owner.' });
        }

        const isBizMatch = await bcrypt.compare(password, business.password);
        if (!isBizMatch) {
          return res.status(400).json({ message: 'Invalid Credentials' });
        }

        if (parentUserWithBiz.subscriptionStatus === 'Pending Approval') {
          return res.status(403).json({
            message: 'The workspace subscription payment is currently pending admin approval. Please contact the business owner.',
            isPendingApproval: true
          });
        }
        if (parentUserWithBiz.subscriptionStatus === 'Rejected') {
          return res.status(403).json({
            message: 'The workspace subscription payment was rejected by the admin. Please contact the business owner.',
            isRejected: true
          });
        }
        if (isSubscriptionExpired(parentUserWithBiz)) {
          const expiryDateStr = formatDateString(parentUserWithBiz.subscription?.validUntil || parentUserWithBiz.subscriptionRenewalDate);
          return res.status(403).json({
            message: `The workspace subscription expired on ${expiryDateStr}. Please contact the business owner to renew the plan.`,
            isExpired: true,
            subscriptionStatus: 'Expired'
          });
        }

        const payload = {
          user: {
            id: parentUserWithBiz.id,
            businessId: business._id.toString(),
            businessName: business.name,
            businessOfferingType: business.offeringType || 'both',
            businessOperationsType: business.operationsType || 'both',
            role: 'business',
            businessType: 4
          }
        };

        const bizCode = `BZ-${business.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()}`;

        return jwt.sign(
          payload,
          process.env.JWT_SECRET || 'fallback_secret',
          { expiresIn: '1d' },
          (err, token) => {
            if (err) throw err;
            res.json({
              token,
              user: {
                id: parentUserWithBiz.id,
                userId: bizCode,
                fullName: business.name,
                email: business.email,
                role: 'business',
                businessId: business._id,
                businessName: business.name,
                businessPhone: business.phone,
                businessAddress: business.address,
                businessRegNo: business.regNo,
                businessOfferingType: business.offeringType || 'both',
                businessOperationsType: business.operationsType || 'both',
                businessType: 4,
                modules: parentUserWithBiz.modules || ['products_services', 'inventory', 'sales', 'expenses']
              }
            });
          }
        );
      }
    }

    // 3. Check if a Branch exists with this email or phone (Branch Login)
    const branchConditions = [{ email: cleanEmail }];
    if (isPhone) {
      branchConditions.push({ contactNumber: cleanPhone });
    }
    const branch = await Branch.findOne({ $or: branchConditions });
    if (branch && branch.password) {
      if (branch.isLoginEnabled === false) {
        return res.status(403).json({ message: 'Login access for this branch is currently disabled by the owner.' });
      }

      const isBranchMatch = await bcrypt.compare(password, branch.password);
      if (!isBranchMatch) {
        return res.status(400).json({ message: 'Invalid Credentials' });
      }

      // Find parent tenant
      let parentUser = null;
      if (branch.tenantId && branch.tenantId !== 'default_tenant') {
        parentUser = await User.findById(branch.tenantId);
      }

      if (parentUser && parentUser.subscriptionStatus === 'Pending Approval') {
        return res.status(403).json({
          message: 'The workspace subscription payment is currently pending admin approval. Please contact the business owner.',
          isPendingApproval: true
        });
      }
      if (parentUser && parentUser.subscriptionStatus === 'Rejected') {
        return res.status(403).json({
          message: 'The workspace subscription payment was rejected by the admin. Please contact the business owner.',
          isRejected: true
        });
      }
      if (parentUser && isSubscriptionExpired(parentUser)) {
        const expiryDateStr = formatDateString(parentUser.subscription?.validUntil || parentUser.subscriptionRenewalDate);
        return res.status(403).json({
          message: `The workspace subscription expired on ${expiryDateStr}. Please contact the business owner to renew the plan.`,
          isExpired: true,
          subscriptionStatus: 'Expired'
        });
      }

      const matchedBiz = parentUser?.businesses?.find(b => b.name === branch.businessName);
      const bizOfferingType = matchedBiz?.offeringType || 'both';
      const bizOperationsType = matchedBiz?.operationsType || 'both';

      const payload = {
        user: {
          id: parentUser ? parentUser.id : branch.tenantId,
          branchId: branch._id.toString(),
          branchName: branch.name,
          businessName: branch.businessName || '',
          businessOfferingType: bizOfferingType,
          businessOperationsType: bizOperationsType,
          role: 'branch',
          businessType: parentUser ? parentUser.businessType : 3
        }
      };

      return jwt.sign(
        payload,
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '1d' },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user: {
              id: parentUser ? parentUser.id : branch.tenantId,
              userId: `BR-${branch.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()}`,
              fullName: branch.manager || branch.name,
              email: branch.email,
              role: 'branch',
              branchId: branch._id,
              branchName: branch.name,
              branchLocation: branch.location,
              businessType: parentUser ? parentUser.businessType : 3,
              businessName: branch.businessName || (parentUser ? parentUser.businessName : 'BizTech Store'),
              businessOfferingType: bizOfferingType,
              businessOperationsType: bizOperationsType,
              modules: parentUser ? parentUser.modules : ['products_services', 'inventory', 'sales', 'expenses']
            }
          });
        }
      );
    }

    // 4. Check if an Employee exists with this email or phone (Employee Login)
    const empConditions = [{ email: cleanEmail }];
    if (isPhone) {
      empConditions.push({ contactNumber: cleanPhone });
    }
    const employee = await Employee.findOne({ $or: empConditions });
    if (employee && employee.password) {
      if (employee.isLoginEnabled === false) {
        return res.status(403).json({ message: 'Login access for this employee is currently disabled.' });
      }

      const isEmpMatch = await bcrypt.compare(password, employee.password);
      if (!isEmpMatch) {
        return res.status(400).json({ message: 'Invalid Credentials' });
      }

      let parentUser = null;
      if (employee.tenantId && employee.tenantId !== 'default_tenant') {
        parentUser = await User.findById(employee.tenantId);
      }

      if (parentUser && parentUser.subscriptionStatus === 'Pending Approval') {
        return res.status(403).json({
          message: 'The workspace subscription payment is currently pending admin approval. Please contact the business owner.',
          isPendingApproval: true
        });
      }
      if (parentUser && parentUser.subscriptionStatus === 'Rejected') {
        return res.status(403).json({
          message: 'The workspace subscription payment was rejected by the admin. Please contact the business owner.',
          isRejected: true
        });
      }
      if (parentUser && isSubscriptionExpired(parentUser)) {
        const expiryDateStr = formatDateString(parentUser.subscription?.validUntil || parentUser.subscriptionRenewalDate);
        return res.status(403).json({
          message: `The workspace subscription expired on ${expiryDateStr}. Please contact the business owner to renew the plan.`,
          isExpired: true,
          subscriptionStatus: 'Expired'
        });
      }

      if (parentUser && Number(parentUser.businessType) === 1) {
        return res.status(403).json({ message: 'Employee login is not available for Type 1 (Single Login) accounts. The owner manages staff records directly.' });
      }

      const matchedBiz = parentUser?.businesses?.find(b => b.name === employee.businessName);
      const bizOfferingType = matchedBiz?.offeringType || 'both';
      const bizOperationsType = matchedBiz?.operationsType || 'both';

      const payload = {
        user: {
          id: parentUser ? parentUser.id : employee.tenantId,
          employeeId: employee._id.toString(),
          role: 'employee',
          branchId: employee.branchId ? employee.branchId.toString() : null,
          branchName: employee.branchName || '',
          businessName: employee.businessName || '',
          businessOfferingType: bizOfferingType,
          businessOperationsType: bizOperationsType,
          businessType: parentUser ? parentUser.businessType : 2
        }
      };

      return jwt.sign(
        payload,
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '1d' },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user: {
              id: parentUser ? parentUser.id : employee.tenantId,
              userId: `EMP-${employee.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()}`,
              fullName: employee.name,
              email: employee.email,
              role: 'employee',
              employeeId: employee._id,
              branchId: employee.branchId,
              branchName: employee.branchName,
              businessName: employee.businessName,
              businessOfferingType: bizOfferingType,
              businessOperationsType: bizOperationsType,
              designation: employee.designation || employee.position || 'Staff',
              position: employee.position || employee.designation || 'Staff',
              status: employee.status || 'Active',
              businessType: parentUser ? parentUser.businessType : 2,
              modules: (Array.isArray(employee.modules) && employee.modules.length > 0)
                ? Array.from(new Set([...employee.modules, 'customers', 'expenses', 'documents', 'reminders']))
                : ['products_services', 'inventory', 'purchases', 'sales', 'attendance', 'leaves', 'customers', 'expenses', 'documents', 'reminders']
            }
          });
        }
      );
    }

    // 5. Check if an Investor exists with this email or phone (Investor Login - Type 3 & 4)
    const invConditions = [{ email: cleanEmail }];
    if (isPhone) {
      invConditions.push({ phone: cleanPhone });
    }
    const investor = await Investor.findOne({ $or: invConditions });
    if (investor && investor.password) {
      if (investor.isLoginEnabled === false || investor.status === 'Inactive') {
        return res.status(403).json({ message: 'Login access for this investor account is currently inactive or disabled by the business owner.' });
      }

      const isInvMatch = await bcrypt.compare(password, investor.password);
      if (!isInvMatch) {
        return res.status(400).json({ message: 'Invalid Credentials' });
      }

      let parentUser = null;
      if (investor.tenantId && investor.tenantId !== 'default_tenant') {
        parentUser = await User.findById(investor.tenantId);
      }

      if (parentUser && Number(parentUser.businessType) < 3) {
        return res.status(403).json({ message: 'Investor accounts are only available for Type 3 (Multi-Branch) and Type 4 (Multi-Business) organizations.' });
      }

      const payload = {
        user: {
          id: parentUser ? parentUser.id : investor.tenantId,
          investorId: investor._id.toString(),
          role: 'investor',
          businessType: parentUser ? parentUser.businessType : 3,
          isReadOnly: true
        }
      };

      return jwt.sign(
        payload,
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '1d' },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user: {
              id: parentUser ? parentUser.id : investor.tenantId,
              userId: investor.investorId || `INV-${investor.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()}`,
              fullName: investor.name,
              email: investor.email,
              phone: investor.phone,
              role: 'investor',
              investorId: investor._id,
              businessType: parentUser ? parentUser.businessType : 3,
              businessName: parentUser ? parentUser.businessName : 'Enterprise',
              investmentAmount: investor.investmentAmount,
              ownershipPercentage: investor.ownershipPercentage,
              associatedBusiness: investor.associatedBusiness,
              associatedBranch: investor.associatedBranch,
              isReadOnly: true,
              modules: ['products_services', 'inventory', 'customers', 'expenses', 'purchases', 'sales', 'documents', 'investors']
            }
          });
        }
      );
    }

    return res.status(400).json({ message: 'Invalid Credentials' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

// @route   PUT /api/auth/update-modules
// @desc    Update user modules
router.put('/update-modules', async (req, res) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const { modules } = req.body;

    if (!Array.isArray(modules)) {
      return res.status(400).json({ message: 'Modules must be an array' });
    }

    const user = await User.findByIdAndUpdate(decoded.user.id, { modules }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user: { id: user.id, fullName: user.fullName, email: user.email, businessType: user.businessType, modules: user.modules } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/auth/onboarding
// @route   POST /api/auth/onboarding
// @desc    Complete or update onboarding process
router.post('/onboarding', async (req, res) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const { 
      businesses, singleBusiness, businessName, address, regNo, phone, 
      branches, employees, modules, businessType, offeringType, businessOfferingType,
      category, categories, subCategory, documents, subscription, ownerName, gstNumber
    } = req.body;
    const userId = decoded.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Validate Mandatory & Non-duplicate PAN Card Number
    const incomingPan = (
      req.body.panNumber || 
      singleBusiness?.panNumber || 
      documents?.pan || 
      user.panNumber || 
      ''
    ).trim().toUpperCase();

    if (!incomingPan) {
      return res.status(400).json({ message: 'PAN card number is mandatory for business registration.' });
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(incomingPan)) {
      return res.status(400).json({ 
        message: 'Invalid PAN card format. Must be 10 characters (5 capital letters, 4 digits, 1 capital letter, e.g. ABCDE1234F).' 
      });
    }

    // Validate Mandatory PAN Card File/Image Upload
    const incomingPanFile = (
      documents?.panFileUrl || 
      (typeof documents?.pan === 'object' ? documents.pan.fileUrl : '') || 
      user.documents?.panFileUrl || 
      ''
    ).trim();

    if (!incomingPanFile) {
      return res.status(400).json({ 
        message: 'PAN Card document / image upload is mandatory. Please upload your PAN card file.' 
      });
    }

    // Check if duplicate PAN exists across other businesses/users
    const existingPanUser = await User.findOne({
      _id: { $ne: userId },
      $or: [
        { panNumber: incomingPan },
        { 'documents.pan': incomingPan },
        { 'businesses.panNumber': incomingPan }
      ]
    });

    if (existingPanUser) {
      return res.status(400).json({ 
        message: `This PAN Card Number (${incomingPan}) is already registered with another business. Please use a unique PAN.` 
      });
    }

    user.panNumber = incomingPan;

    // Handle Owner Name and GST Number
    const incomingOwnerName = (
      ownerName || 
      singleBusiness?.ownerName || 
      singleBusiness?.contactPerson || 
      user.ownerName || 
      user.fullName || 
      ''
    ).trim();
    if (incomingOwnerName) {
      user.ownerName = incomingOwnerName;
      if (!user.fullName || user.fullName === 'Business Owner') {
        user.fullName = incomingOwnerName;
      }
    }

    const incomingGst = (
      gstNumber || 
      singleBusiness?.gstNumber || 
      singleBusiness?.taxNumber || 
      documents?.gstin || 
      user.gstNumber || 
      ''
    ).trim().toUpperCase();
    if (incomingGst) {
      user.gstNumber = incomingGst;
    }

    // 1. Update User details (business, modules, etc.)
    if (category) user.category = category;
    if (categories && Array.isArray(categories)) {
      user.categories = categories;
      if (!user.category) user.category = categories.join(', ');
    }
    if (subCategory) user.subCategory = subCategory;
    if (documents) {
      user.documents = {
        pan: incomingPan,
        panType: documents.panType || 'ID Card',
        panExpiryDate: documents.panExpiryDate || null,
        panFileUrl: incomingPanFile,
        panFileName: documents.panFileName || '',
        gstin: incomingGst || documents.gstin || user.documents?.gstin || '',
        gstinType: documents.gstinType || 'Certificate',
        gstinExpiryDate: documents.gstinExpiryDate || null,
        gstinFileUrl: documents.gstinFileUrl || '',
        gstinFileName: documents.gstinFileName || '',
        msme: documents.msme || user.documents?.msme || '',
        msmeType: documents.msmeType || 'Registration',
        msmeExpiryDate: documents.msmeExpiryDate || null,
        msmeFileUrl: documents.msmeFileUrl || '',
        msmeFileName: documents.msmeFileName || '',
        fssai: documents.fssai || user.documents?.fssai || '',
        fssaiType: documents.fssaiType || 'License',
        fssaiExpiryDate: documents.fssaiExpiryDate || null,
        fssaiFileUrl: documents.fssaiFileUrl || '',
        fssaiFileName: documents.fssaiFileName || '',
        tradeLicense: documents.tradeLicense || user.documents?.tradeLicense || '',
        customDocuments: Array.isArray(documents.customDocuments) ? documents.customDocuments : (user.documents?.customDocuments || [])
      };
      user.markModified('documents');
    } else {
      if (!user.documents) user.documents = {};
      user.documents.pan = incomingPan;
      user.documents.panFileUrl = incomingPanFile;
      if (incomingGst) user.documents.gstin = incomingGst;
    }
    let isPendingApproval = false;
    let createdApprovalId = null;

    if (subscription) {
      const isUpiQr = (subscription.paymentMethod || '').includes('UPI') || Boolean(req.body.paymentProof);
      const isExistingActive = (subscription.paymentMethod === 'Existing Plan' || req.body.isSetupUpdate) && 
                               user.subscriptionStatus === 'Active' && 
                               user.subscription?.validUntil && 
                               new Date(user.subscription.validUntil) > new Date();

      if (!isExistingActive) {
        const subStatus = isUpiQr ? 'Pending Approval' : (subscription.paymentStatus || 'Active');
        const isAnnual = (subscription.billingCycle || '').toLowerCase() === 'annual' || (subscription.billingCycle || '').toLowerCase() === 'yearly';
        const resolvedCycle = isAnnual ? 'Annual' : 'Monthly';
        const now = new Date();
        const validUntil = calculatePlanExpiry(resolvedCycle, now);

        user.subscription = {
          planId: subscription.planId || user.subscription?.planId || '',
          planName: subscription.planName || user.subscription?.planName || 'Starter Plan',
          amount: subscription.amount !== undefined ? subscription.amount : (user.subscription?.amount || 0),
          billingCycle: resolvedCycle,
          paymentMethod: subscription.paymentMethod || (isUpiQr ? 'UPI (Admin QR)' : 'Razorpay'),
          paymentStatus: subStatus,
          transactionId: subscription.transactionId || `TXN-${Date.now()}`,
          startDate: now,
          validUntil: validUntil
        };
        user.subscriptionStatus = subStatus;
        user.subscriptionRenewalDate = validUntil;
        user.subscriptionBillingCycle = resolvedCycle;

        if (isUpiQr) {
          isPendingApproval = true;
          const proofData = req.body.paymentProof || {};
          const utr = (proofData.utrNumber || subscription.transactionId || '').trim();
          const proofUrl = (proofData.proofUrl || '').trim();
          const originalFileName = (proofData.originalFileName || '').trim();

          // Create or Update PaymentApproval audit entry
          const approvalRecord = new PaymentApproval({
            tenantId: user._id,
            businessName: singleBusiness?.name || businessName || user.businessName || 'New Workspace',
            ownerName: incomingOwnerName || user.fullName || '',
            email: user.email,
            phone: singleBusiness?.phone || phone || user.businessPhone || user.phone || '',
            panNumber: incomingPan,
            businessType: user.businessType || 1,
            planId: subscription.planId || '',
            planName: subscription.planName || 'Starter Plan',
            billingCycle: subscription.billingCycle || 'Monthly',
            amount: subscription.amount !== undefined ? subscription.amount : 0,
            paymentMethod: 'UPI (Admin QR)',
            utrNumber: utr,
            proofUrl: proofUrl,
            originalFileName: originalFileName,
            status: 'Pending',
            history: [{
              action: 'Submitted',
              previousStatus: 'None',
              newStatus: 'Pending',
              actor: user.fullName || 'Tenant Owner',
              note: `Payment proof submitted via UPI QR (UTR: ${utr})`,
              timestamp: new Date()
            }]
          });
          await approvalRecord.save();
          createdApprovalId = approvalRecord._id;

          user.paymentProof = {
            approvalId: approvalRecord._id,
            utrNumber: utr,
            proofUrl: proofUrl,
            originalFileName: originalFileName,
            status: 'Pending',
            submittedAt: new Date()
          };
        }
      }
    }
    if (offeringType) {
      user.offeringType = offeringType;
      user.businessOfferingType = offeringType;
    }
    if (businessOfferingType) {
      user.businessOfferingType = businessOfferingType;
      user.offeringType = businessOfferingType;
    }
    if (businessType !== undefined && businessType !== null) {
      const newType = Number(businessType);
      user.businessType = newType;
      // Auto-apply preset employee, branch, and business limits from pricing plan if user doesn't already have them
      const plan = await Pricing.findOne({ customerType: { $regex: new RegExp('Type ' + newType, 'i') } });
      if (user.employeeLimit === null || user.employeeLimit === undefined) {
        user.employeeLimit = (plan && plan.employeeLimit != null) ? plan.employeeLimit : (newType <= 3 ? 10 : null);
      }
      if (user.branchLimit === null || user.branchLimit === undefined) {
        if (newType === 3) user.branchLimit = (plan && plan.branchLimit != null) ? plan.branchLimit : 5;
        if (newType === 4) user.branchLimit = (plan && plan.branchLimit != null) ? plan.branchLimit : 10;
      }
      if (user.businessLimit === null || user.businessLimit === undefined) {
        if (newType === 4) user.businessLimit = (plan && plan.businessLimit != null) ? plan.businessLimit : 3;
      }
    }
    if (singleBusiness) {
      if (singleBusiness.name) user.businessName = singleBusiness.name;
      if (singleBusiness.address) user.address = singleBusiness.address;
      if (singleBusiness.regNo) user.regNo = singleBusiness.regNo;
      if (singleBusiness.phone) user.businessPhone = singleBusiness.phone;
      if (singleBusiness.panNumber) user.panNumber = singleBusiness.panNumber;
      if (singleBusiness.ownerName) user.ownerName = singleBusiness.ownerName;
      if (singleBusiness.gstNumber) user.gstNumber = singleBusiness.gstNumber;
      if (singleBusiness.city || req.body.city) user.city = singleBusiness.city || req.body.city;
      if (singleBusiness.state || req.body.state) user.state = singleBusiness.state || req.body.state;
      if (singleBusiness.pincode || req.body.pincode) user.pincode = singleBusiness.pincode || req.body.pincode;
      if (singleBusiness.streetAddress || req.body.streetAddress) user.streetAddress = singleBusiness.streetAddress || req.body.streetAddress;

      if (user.businesses && user.businesses.length > 0) {
        if (singleBusiness.name) user.businesses[0].name = singleBusiness.name;
        if (singleBusiness.phone) user.businesses[0].phone = singleBusiness.phone;
        if (singleBusiness.address) user.businesses[0].address = singleBusiness.address;
        if (singleBusiness.city || req.body.city) user.businesses[0].city = singleBusiness.city || req.body.city;
        if (singleBusiness.state || req.body.state) user.businesses[0].state = singleBusiness.state || req.body.state;
        if (singleBusiness.pincode || req.body.pincode) user.businesses[0].pincode = singleBusiness.pincode || req.body.pincode;
        if (singleBusiness.streetAddress || req.body.streetAddress) user.businesses[0].streetAddress = singleBusiness.streetAddress || req.body.streetAddress;
        if (singleBusiness.panNumber) user.businesses[0].panNumber = singleBusiness.panNumber;
        if (singleBusiness.ownerName) user.businesses[0].ownerName = singleBusiness.ownerName;
        if (singleBusiness.gstNumber) user.businesses[0].gstNumber = singleBusiness.gstNumber;
        if (singleBusiness.category || category) user.businesses[0].category = singleBusiness.category || category;
        if (singleBusiness.categories || categories) user.businesses[0].categories = singleBusiness.categories || categories;
      }
    }
    if (businessName) user.businessName = businessName;
    if (address) user.address = address;
    if (regNo) user.regNo = regNo;
    if (phone && !user.businessPhone) user.businessPhone = phone;

    if (modules && Array.isArray(modules) && modules.length > 0) {
      user.modules = Array.from(new Set([...modules, 'documents', 'reminders', 'expenses', 'customers', 'sales']));
    } else {
      user.modules = Array.from(new Set([...(user.modules || []), 'documents', 'reminders', 'expenses', 'customers', 'sales']));
    }
    if (businesses && Array.isArray(businesses) && businesses.length > 0) user.businesses = businesses;
    if (!isPendingApproval) {
      user.isOnboardingCompleted = true;
    }
    await user.save();

    // 2. Upsert Branches
    if (branches && branches.length > 0) {
      for (const b of branches) {
        if (!b.name) continue;
        await Branch.findOneAndUpdate(
          { tenantId: userId, name: b.name },
          {
            name: b.name,
            location: b.location || '',
            manager: b.manager || '',
            contactNumber: b.phone || b.contactNumber || '',
            type: b.type || 'Store',
            businessName: b.business || b.businessName || '',
            tenantId: userId
          },
          { upsert: true, new: true }
        );
      }
    }

    // 3. Upsert Employees
    if (employees && employees.length > 0) {
      const userDoc = await User.findById(userId);
      let allowedEmployees = employees;
      if (userDoc && typeof userDoc.employeeLimit === 'number' && userDoc.employeeLimit > 0) {
        allowedEmployees = employees.slice(0, userDoc.employeeLimit);
      }
      const createdBranches = await Branch.find({ tenantId: userId });
      const branchMap = {};
      createdBranches.forEach(b => {
        branchMap[b.name] = b._id;
      });

      for (const e of allowedEmployees) {
        if (!e.name || !e.email) continue;
        const salary = typeof e.salary === 'number' ? e.salary : (parseInt((e.salary || '').replace(/[^0-9]/g, ''), 10) || 0);
        await Employee.findOneAndUpdate(
          { email: e.email, tenantId: userId },
          {
            employeeId: e.employeeId || '',
            name: e.name,
            email: e.email,
            designation: e.designation || e.role || e.position || 'Staff',
            position: e.role || e.position || 'Staff',
            contactNumber: e.phone || e.contactNumber || '',
            salary,
            dateOfJoining: e.dateOfJoining || Date.now(),
            shiftFrom: e.shiftFrom || '',
            shiftTo: e.shiftTo || '',
            workType: e.workType || 'Full-Time',
            address: e.address || '',
            businessName: e.business || e.businessName || '',
            branchName: e.branch || e.branchName || (createdBranches[0] ? createdBranches[0].name : 'Main Office'),
            branchId: branchMap[e.branch || e.branchName] || (createdBranches.length > 0 ? createdBranches[0]._id : null),
            tenantId: userId
          },
          { upsert: true, new: true }
        );
      }
    }

    // 4. Sync Documents to Document collection so they appear immediately in the /tenant/documents page
    if (documents) {
      try {
        const docsToSync = [];
        const extractDoc = (docField, defaultTitle, defaultType) => {
          if (!docField) return null;
          if (typeof docField === 'string' && docField.trim()) {
            return {
              title: defaultTitle,
              type: defaultType,
              documentNumber: docField.trim(),
              fileUrl: '',
              fileName: '',
              expiryDate: null
            };
          }
          if (typeof docField === 'object' && (docField.number || docField.documentNumber || docField.fileUrl)) {
            return {
              title: docField.title || docField.name || defaultTitle,
              type: docField.type || defaultType,
              documentNumber: (docField.number || docField.documentNumber || '').trim(),
              fileUrl: docField.fileUrl || '',
              fileName: docField.fileName || '',
              expiryDate: docField.expiryDate ? new Date(docField.expiryDate) : null
            };
          }
          return null;
        };

        // Standard 1: PAN Card
        const panDoc = extractDoc(documents.pan, 'Business / Proprietor PAN Card', 'ID Card');
        if (panDoc) {
          if (!panDoc.documentNumber && incomingPan) panDoc.documentNumber = incomingPan;
          if (documents.panFileUrl) panDoc.fileUrl = documents.panFileUrl;
          if (documents.panFileName) panDoc.fileName = documents.panFileName;
          if (documents.panExpiryDate) panDoc.expiryDate = new Date(documents.panExpiryDate);
          docsToSync.push(panDoc);
        } else if (incomingPan) {
          docsToSync.push({
            title: 'Business / Proprietor PAN Card',
            type: 'ID Card',
            documentNumber: incomingPan,
            fileUrl: documents.panFileUrl || '',
            fileName: documents.panFileName || '',
            expiryDate: documents.panExpiryDate ? new Date(documents.panExpiryDate) : null
          });
        }

        // Standard 2: GSTIN Certificate
        const gstDoc = extractDoc(documents.gstin, 'GSTIN Certificate', 'Certificate');
        if (gstDoc) {
          if (!gstDoc.documentNumber && incomingGst) gstDoc.documentNumber = incomingGst;
          if (documents.gstinFileUrl) gstDoc.fileUrl = documents.gstinFileUrl;
          if (documents.gstinFileName) gstDoc.fileName = documents.gstinFileName;
          if (documents.gstinExpiryDate) gstDoc.expiryDate = new Date(documents.gstinExpiryDate);
          docsToSync.push(gstDoc);
        } else if (incomingGst) {
          docsToSync.push({
            title: 'GSTIN Certificate',
            type: 'Certificate',
            documentNumber: incomingGst,
            fileUrl: documents.gstinFileUrl || '',
            fileName: documents.gstinFileName || '',
            expiryDate: documents.gstinExpiryDate ? new Date(documents.gstinExpiryDate) : null
          });
        }

        // Standard 3: MSME Registration
        const msmeDoc = extractDoc(documents.msme, 'MSME / Udyam Registration', 'Registration');
        if (msmeDoc) {
          if (documents.msmeFileUrl) msmeDoc.fileUrl = documents.msmeFileUrl;
          if (documents.msmeFileName) msmeDoc.fileName = documents.msmeFileName;
          if (documents.msmeExpiryDate) msmeDoc.expiryDate = new Date(documents.msmeExpiryDate);
          docsToSync.push(msmeDoc);
        }

        // Standard 4: FSSAI Food License
        const fssaiDoc = extractDoc(documents.fssai, 'Food License (FSSAI)', 'License');
        if (fssaiDoc) {
          if (documents.fssaiFileUrl) fssaiDoc.fileUrl = documents.fssaiFileUrl;
          if (documents.fssaiFileName) fssaiDoc.fileName = documents.fssaiFileName;
          if (documents.fssaiExpiryDate) fssaiDoc.expiryDate = new Date(documents.fssaiExpiryDate);
          docsToSync.push(fssaiDoc);
        }

        // Additional / Custom Documents
        const customList = Array.isArray(documents.customDocuments) 
          ? documents.customDocuments 
          : Array.isArray(documents.documentList) 
          ? documents.documentList 
          : [];

        for (const cd of customList) {
          if (cd.name || cd.title || cd.number || cd.documentNumber || cd.fileUrl) {
            docsToSync.push({
              title: cd.name || cd.title || 'Official Document',
              type: cd.type || 'Registration',
              documentNumber: (cd.number || cd.documentNumber || '').trim(),
              fileUrl: cd.fileUrl || '',
              fileName: cd.fileName || '',
              expiryDate: cd.expiryDate ? new Date(cd.expiryDate) : null
            });
          }
        }

        for (const item of docsToSync) {
          await Document.findOneAndUpdate(
            { tenantId: userId, title: item.title },
            { 
              tenantId: userId,
              title: item.title,
              type: item.type,
              documentNumber: item.documentNumber,
              fileUrl: item.fileUrl,
              fileName: item.fileName,
              expiryDate: item.expiryDate
            },
            { upsert: true, new: true }
          );
        }
      } catch (docErr) {
        console.error('Error syncing onboarding documents to Document collection:', docErr);
      }
    }

    // 5. Sync Categories & Sub-Categories to Category and SubCategory collections
    try {
      await seedCatalogueFromUser(userId, req.body.catalogueData);
    } catch (catSyncErr) {
      console.error('Error syncing onboarding catalogue to Category/SubCategory collections:', catSyncErr);
    }

    const updatedUser = await User.findById(userId).select('-password');
    res.json({
      message: isPendingApproval ? 'Onboarding completed. Payment proof submitted for admin verification.' : 'Onboarding saved successfully',
      user: updatedUser,
      isPendingApproval,
      approvalId: createdApprovalId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/auth/onboarding-data
// @desc    Get user onboarding & setup data to prefill wizard
router.get('/onboarding-data', async (req, res) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    let user = await User.findById(decoded.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.userId) {
      user.userId = user.get('uniqueId') || await generateUserId();
      await user.save();
    }

    const branches = await Branch.find({ tenantId: user.id }).select('-password');
    const employees = await Employee.find({ tenantId: user.id });

    res.json({
      user,
      branches,
      employees
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get user or branch profile
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Check if this is a Business session
    if (decoded?.user?.role === 'business') {
      const parentUser = await User.findById(decoded.user.id).select('-password');
      if (!parentUser) return res.status(404).json({ message: 'Owner tenant not found' });

      const business = parentUser.businesses.id(decoded.user.businessId) || 
                       parentUser.businesses.find(b => b.name === decoded.user.businessName);
      if (!business) return res.status(404).json({ message: 'Business not found' });

      return res.json({
        _id: parentUser._id,
        id: parentUser.id,
        userId: `BZ-${business.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()}`,
        fullName: business.name,
        email: business.email || parentUser.email,
        phone: business.phone,
        role: 'business',
        businessId: business._id,
        businessName: business.name,
        businessAddress: business.address,
        businessRegNo: business.regNo,
        businessOfferingType: business.offeringType || 'both',
        businessOperationsType: business.operationsType || 'both',
        businessType: 4,
        modules: parentUser.modules || ['products_services', 'inventory', 'sales', 'expenses']
      });
    }

    // Check if this is a Branch session
    if (decoded?.user?.role === 'branch') {
      const branch = await Branch.findById(decoded.user.branchId);
      const parentUser = await User.findById(decoded.user.id).select('-password');
      if (!branch) return res.status(404).json({ message: 'Branch not found' });

      const matchedBiz = parentUser?.businesses?.find(b => b.name === branch.businessName);
      const bizOfferingType = matchedBiz?.offeringType || 'both';
      const bizOperationsType = matchedBiz?.operationsType || 'both';

      return res.json({
        _id: parentUser ? parentUser._id : decoded.user.id,
        id: parentUser ? parentUser.id : decoded.user.id,
        userId: `BR-${branch.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()}`,
        fullName: branch.manager || branch.name,
        email: branch.email,
        phone: branch.contactNumber,
        role: 'branch',
        branchId: branch._id,
        branchName: branch.name,
        branchLocation: branch.location,
        businessType: parentUser ? parentUser.businessType : 3,
        businessName: branch.businessName || (parentUser ? parentUser.businessName : 'BizTech Store'),
        businessOfferingType: bizOfferingType,
        businessOperationsType: bizOperationsType,
        modules: parentUser ? parentUser.modules : ['products_services', 'inventory', 'sales', 'expenses']
      });
    }

    // Check if this is an Employee session
    if (decoded?.user?.role === 'employee') {
      const employee = await Employee.findById(decoded.user.employeeId);
      if (!employee) return res.status(404).json({ message: 'Employee not found' });

      let parentUser = null;
      if (employee.tenantId && employee.tenantId !== 'default_tenant') {
        parentUser = await User.findById(employee.tenantId).select('-password');
      }
      const matchedBiz = parentUser?.businesses?.find(b => b.name === employee.businessName);
      const bizOfferingType = matchedBiz?.offeringType || 'both';
      const bizOperationsType = matchedBiz?.operationsType || 'both';

      return res.json({
        _id: employee._id,
        id: decoded.user.id,
        employeeId: employee._id,
        userId: `EMP-${employee.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()}`,
        fullName: employee.name,
        email: employee.email,
        phone: employee.contactNumber,
        role: 'employee',
        branchId: employee.branchId,
        branchName: employee.branchName,
        businessName: employee.businessName,
        businessOfferingType: bizOfferingType,
        businessOperationsType: bizOperationsType,
        designation: employee.designation || employee.position || 'Staff',
        position: employee.position || employee.designation || 'Staff',
        status: employee.status || 'Active',
        modules: (Array.isArray(employee.modules) && employee.modules.length > 0)
          ? Array.from(new Set([...employee.modules, 'customers', 'expenses', 'documents', 'reminders']))
          : ['products_services', 'inventory', 'purchases', 'sales', 'attendance', 'leaves', 'customers', 'expenses', 'documents', 'reminders']
      });
    }

    // Check if this is an Investor session
    if (decoded?.user?.role === 'investor') {
      const investor = await Investor.findById(decoded.user.investorId);
      if (!investor) return res.status(404).json({ message: 'Investor profile not found' });

      let parentUser = null;
      if (investor.tenantId && investor.tenantId !== 'default_tenant') {
        parentUser = await User.findById(investor.tenantId).select('-password');
      }

      return res.json({
        _id: investor._id,
        id: decoded.user.id,
        investorId: investor._id,
        userId: investor.investorId || `INV-${investor.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()}`,
        fullName: investor.name,
        email: investor.email,
        phone: investor.phone,
        role: 'investor',
        businessType: parentUser ? parentUser.businessType : 3,
        businessName: parentUser ? parentUser.businessName : 'Enterprise',
        investmentAmount: investor.investmentAmount,
        ownershipPercentage: investor.ownershipPercentage,
        associatedBusiness: investor.associatedBusiness,
        associatedBranch: investor.associatedBranch,
        status: investor.status,
        isReadOnly: true,
        modules: ['products_services', 'inventory', 'customers', 'expenses', 'purchases', 'sales', 'documents', 'investors']
      });
    }

    let user = await User.findById(decoded.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.userId) {
      user.userId = user.get('uniqueId') || await generateUserId();
      await user.save();
    }

    const sanitizedUser = user.toObject();
    const expired = isSubscriptionExpired(user);
    sanitizedUser.isExpired = expired;
    sanitizedUser.subscriptionStatus = user.subscriptionStatus;
    if (user.subscription) {
      sanitizedUser.subscription = {
        ...(sanitizedUser.subscription || {}),
        expiryFormatted: formatDateString(user.subscription.validUntil || user.subscriptionRenewalDate)
      };
    }
    if (sanitizedUser.businesses) {
      sanitizedUser.businesses = sanitizedUser.businesses.map(b => {
        const hasPassword = Boolean(b.password);
        delete b.password;
        b.hasPassword = hasPassword;
        return b;
      });
    }

    res.json(sanitizedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/auth/switch-business
// @desc    Switch active session into a business or back to owner
router.post('/switch-business', async (req, res) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const { businessId, switchToOwner } = req.body;

    const parentUser = await User.findById(decoded.user.id);
    if (!parentUser) return res.status(404).json({ message: 'User not found' });

    // Switch back to owner
    if (switchToOwner) {
      const payload = {
        user: {
          id: parentUser.id,
          businessType: parentUser.businessType,
          role: 'owner'
        }
      };

      return jwt.sign(
        payload,
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '1d' },
        (err, newToken) => {
          if (err) throw err;
          res.json({
            token: newToken,
            user: {
              id: parentUser.id,
              userId: parentUser.userId,
              fullName: parentUser.fullName,
              email: parentUser.email,
              role: 'owner',
              businessType: parentUser.businessType,
              businessName: parentUser.businessName,
              businesses: (parentUser.businesses || []).map(b => {
                const obj = b.toObject ? b.toObject() : { ...b };
                delete obj.password;
                obj.hasPassword = Boolean(b.password);
                return obj;
              }),
              modules: parentUser.modules
            }
          });
        }
      );
    }

    // Switch into specific business
    const business = parentUser.businesses.id(businessId) || parentUser.businesses.find(b => b.name === businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const payload = {
      user: {
        id: parentUser.id,
        businessId: business._id.toString(),
        businessName: business.name,
        businessOfferingType: business.offeringType || 'both',
        businessOperationsType: business.operationsType || 'both',
        role: 'business',
        businessType: 4
      }
    };

    const bizCode = `BZ-${business.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()}`;

    return jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' },
      (err, newToken) => {
        if (err) throw err;
        res.json({
          token: newToken,
          user: {
            id: parentUser.id,
            userId: bizCode,
            fullName: business.name,
            email: business.email || parentUser.email,
            role: 'business',
            businessId: business._id,
            businessName: business.name,
            businessPhone: business.phone,
            businessAddress: business.address,
            businessRegNo: business.regNo,
            businessOfferingType: business.offeringType || 'both',
            businessOperationsType: business.operationsType || 'both',
            businessType: 4,
            modules: parentUser.modules
          }
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const { fullName, phone, businessName, industry, address, regNo, businessPhone, businessLogo } = req.body;

    const user = await User.findById(decoded.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (businessName !== undefined) user.businessName = businessName;
    if (businessLogo !== undefined) user.businessLogo = businessLogo;
    if (industry !== undefined) user.industry = industry;
    if (address !== undefined) user.address = address;
    if (regNo !== undefined) user.regNo = regNo;
    if (businessPhone !== undefined) user.businessPhone = businessPhone;

    await user.save();
    const updatedUser = await User.findById(user._id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
router.put('/change-password', async (req, res) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(decoded.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Validate current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password does not match' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/auth/renew-plan
// @desc    Repurchase or renew subscription plan (Monthly: 30 days, Annual: 365 days)
// @access  Public (via email/phone + password) OR Authenticated (via Bearer token)
router.post('/renew-plan', async (req, res) => {
  try {
    let user = null;
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        if (decoded?.user?.id) {
          user = await User.findById(decoded.user.id);
        }
      } catch (e) {
        // Token might be expired, fall through to credentials
      }
    }

    if (!user) {
      const { emailOrPhone, email, phone, password } = req.body;
      const rawIdentifier = (emailOrPhone || email || phone || '').trim();
      if (!rawIdentifier) {
        return res.status(400).json({ message: 'Please enter your registered email or phone number.' });
      }
      if (!password) {
        return res.status(400).json({ message: 'Please enter your password to authorize plan renewal.' });
      }

      const cleanInput = rawIdentifier.toLowerCase();
      const digitsOnly = rawIdentifier.replace(/[^0-9]/g, '');
      const isPhone = digitsOnly.length === 10;

      const conditions = [{ email: cleanInput }];
      if (isPhone) conditions.push({ phone: digitsOnly });

      user = await User.findOne({ $or: conditions });
      if (!user) {
        return res.status(404).json({ message: 'No registered workspace account found for this email or phone.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect password. Please verify your credentials and try again.' });
      }
    }

    const {
      planId,
      planName,
      billingCycle,
      amount,
      paymentMethod,
      transactionId,
      paymentProof,
      razorpayPayment
    } = req.body;

    const isAnnual = (billingCycle || '').toLowerCase() === 'annual' || (billingCycle || '').toLowerCase() === 'yearly';
    const resolvedCycle = isAnnual ? 'Annual' : 'Monthly';
    const isUpiQr = (paymentMethod || '').includes('UPI') || Boolean(paymentProof);
    const now = new Date();
    const validUntil = calculatePlanExpiry(resolvedCycle, now);
    const resolvedAmount = Number(amount) || (isAnnual ? 8400 : 1000);

    if (isUpiQr) {
      // 1. UPI QR Flow -> Submit proof for Admin Approval
      const proofData = paymentProof || {};
      const utr = (proofData.utrNumber || transactionId || '').trim();
      const proofUrl = (proofData.proofUrl || '').trim();
      const originalFileName = (proofData.originalFileName || '').trim();

      if (!utr) {
        return res.status(400).json({ message: 'Please enter the 12-digit UPI UTR / Transaction Reference Number.' });
      }
      if (!proofUrl) {
        return res.status(400).json({ message: 'Please upload your UPI payment screenshot or receipt proof.' });
      }

      const approvalRecord = new PaymentApproval({
        tenantId: user._id,
        businessName: user.businessName || 'Workspace',
        ownerName: user.ownerName || user.fullName || 'Tenant Owner',
        email: user.email,
        phone: user.businessPhone || user.phone || '',
        panNumber: user.panNumber || '',
        businessType: user.businessType || 1,
        planId: planId || user.subscription?.planId || 'Starter Plan',
        planName: planName || user.subscription?.planName || 'Starter Plan',
        billingCycle: resolvedCycle,
        amount: resolvedAmount,
        paymentMethod: 'UPI (Admin QR)',
        utrNumber: utr,
        proofUrl: proofUrl,
        originalFileName: originalFileName,
        status: 'Pending',
        history: [{
          action: 'Submitted',
          previousStatus: user.subscriptionStatus || 'Expired',
          newStatus: 'Pending',
          actor: user.fullName || 'Tenant Owner',
          note: `Plan renewal requested (${resolvedCycle} - ₹${resolvedAmount}) via UPI QR (UTR: ${utr})`,
          timestamp: now
        }]
      });
      await approvalRecord.save();

      user.subscriptionStatus = 'Pending Approval';
      user.subscription = {
        planId: planId || user.subscription?.planId || 'Starter Plan',
        planName: planName || user.subscription?.planName || 'Starter Plan',
        amount: resolvedAmount,
        billingCycle: resolvedCycle,
        paymentMethod: 'UPI (Admin QR)',
        paymentStatus: 'Pending Approval',
        transactionId: utr,
        startDate: now,
        validUntil: validUntil
      };
      user.paymentProof = {
        approvalId: approvalRecord._id,
        utrNumber: utr,
        proofUrl: proofUrl,
        originalFileName: originalFileName,
        status: 'Pending',
        submittedAt: now
      };
      user.subscriptionRenewalDate = validUntil;
      user.subscriptionBillingCycle = resolvedCycle;

      await user.save();

      return res.json({
        success: true,
        isPendingApproval: true,
        message: 'Renewal payment proof submitted successfully! Platform admin will verify and reactivate your workspace.',
        approvalId: approvalRecord._id
      });
    } else {
      // 2. Razorpay Flow -> Instant Activation
      const rzpPaymentId = razorpayPayment?.razorpay_payment_id || transactionId || `RPY-${Date.now()}`;

      user.subscriptionStatus = 'Active';
      user.isOnboardingCompleted = true;
      user.subscription = {
        planId: planId || user.subscription?.planId || 'Starter Plan',
        planName: planName || user.subscription?.planName || 'Starter Plan',
        amount: resolvedAmount,
        billingCycle: resolvedCycle,
        paymentMethod: 'Razorpay',
        paymentStatus: 'Active',
        transactionId: rzpPaymentId,
        startDate: now,
        validUntil: validUntil
      };
      user.subscriptionRenewalDate = validUntil;
      user.subscriptionBillingCycle = resolvedCycle;

      await user.save();

      // Record approved payment approval entry for audit & paid invoice history
      try {
        const approvedRecord = new PaymentApproval({
          tenantId: user._id,
          businessName: user.businessName || 'Workspace',
          ownerName: user.ownerName || user.fullName || 'Tenant Owner',
          email: user.email,
          phone: user.businessPhone || user.phone || '',
          panNumber: user.panNumber || '',
          businessType: user.businessType || 1,
          planId: planId || user.subscription?.planId || 'Starter Plan',
          planName: planName || user.subscription?.planName || 'Starter Plan',
          billingCycle: resolvedCycle,
          amount: resolvedAmount,
          paymentMethod: 'Razorpay',
          utrNumber: rzpPaymentId,
          proofUrl: '',
          originalFileName: '',
          status: 'Approved',
          reviewedBy: 'Razorpay Gateway',
          reviewedAt: now,
          history: [{
            action: 'Approved',
            previousStatus: 'None',
            newStatus: 'Approved',
            actor: 'Razorpay Gateway',
            note: `Plan purchased online via Razorpay (${rzpPaymentId})`,
            timestamp: now
          }]
        });
        await approvedRecord.save();
      } catch (logErr) {
        console.warn('Error saving Razorpay payment approval record:', logErr);
      }

      // Issue JWT token
      const payload = {
        user: {
          id: user.id,
          businessType: user.businessType,
          role: 'owner'
        }
      };

      const loginToken = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '1d' }
      );

      return res.json({
        success: true,
        isReactivated: true,
        message: `Plan successfully repurchased! Your workspace is active for ${resolvedCycle === 'Annual' ? '1 Year (365 Days)' : '30 Days'}.`,
        token: loginToken,
        user: {
          id: user.id,
          userId: user.userId,
          fullName: user.fullName,
          email: user.email,
          role: 'owner',
          businessType: user.businessType,
          businessName: user.businessName,
          isOnboardingCompleted: true,
          subscriptionStatus: 'Active',
          validUntil: validUntil,
          modules: user.modules
        }
      });
    }
  } catch (err) {
    console.error('Renew plan error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to repurchase plan' });
  }
});

module.exports = router;