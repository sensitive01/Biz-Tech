const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Pricing = require('../models/Pricing');
const Branch = require('../models/Branch');
const Employee = require('../models/Employee');
const Customer = require('../models/Customer');
const Inventory = require('../models/Inventory');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Reminder = require('../models/Reminder');
const { seedCatalogueFromUser } = require('../utils/catalogueSeeder');
const Document = require('../models/Document');
const Investor = require('../models/Investor');
const { checkEmailInUse } = require('../utils/emailValidator');
const { checkPhoneInUse } = require('../utils/phoneValidator');

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

// Helper to find or seed the default superadmin
const getAdminFromRequest = async (req) => {
  const authHeader = req.header('Authorization');
  let adminId = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      if (decoded && decoded.admin && decoded.admin.id) {
        adminId = decoded.admin.id;
      }
    } catch (e) {
      // Token expired or invalid
    }
  }

  let admin = null;
  if (adminId) {
    admin = await Admin.findById(adminId);
  }

  if (!admin) {
    admin = await Admin.findOne({ email: 'admin@biztech.com' });
  }

  if (!admin) {
    admin = await Admin.findOne();
  }

  if (!admin) {
    const hashedPassword = await bcrypt.hash('admin@123', 10);
    admin = new Admin({
      email: 'admin@biztech.com',
      password: hashedPassword,
      name: 'Admin User',
      phone: '+91 98765 43210',
      role: 'Superadmin',
      designation: 'Platform Administrator',
      department: 'Operations & Management'
    });
    await admin.save();
  }

  return admin;
};

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const generateNextEmployeeId = async (tenantId) => {
  const existing = await Employee.find({ tenantId }).select('employeeId');
  const existingIds = new Set(existing.map(e => (e.employeeId || '').trim().toUpperCase()));
  let count = existing.length + 1;
  while (existingIds.has(`EMP-${String(count).padStart(3, '0')}`)) {
    count++;
  }
  return `EMP-${String(count).padStart(3, '0')}`;
};

const generateNextBranchId = async (tenantId) => {
  const existing = await Branch.find({ tenantId }).select('branchId branchCode');
  const existingIds = new Set(
    existing.map(b => (b.branchId || b.branchCode || '').trim().toUpperCase())
  );
  let count = existing.length + 1;
  while (existingIds.has(`BR-${String(count).padStart(3, '0')}`)) {
    count++;
  }
  return `BR-${String(count).padStart(3, '0')}`;
};

const generateNextBusinessId = (businesses = []) => {
  const existingIds = new Set(
    businesses.map(b => (b.businessId || b.businessCode || '').trim().toUpperCase())
  );
  let count = businesses.length + 1;
  while (existingIds.has(`BIZ-${String(count).padStart(3, '0')}`)) {
    count++;
  }
  return `BIZ-${String(count).padStart(3, '0')}`;
};

// @route   POST /api/admin/login
// @desc    Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let admin = await Admin.findOne({ email });

    // Auto-create default admin if none exists
    if (!admin && email === 'admin@biztech.com') {
      const hashedPassword = await bcrypt.hash('admin@123', 10);
      admin = new Admin({
        email: 'admin@biztech.com',
        password: hashedPassword,
        name: 'Admin User',
        phone: '+91 98765 43210',
        role: 'Superadmin',
        designation: 'Platform Administrator',
        department: 'Operations & Management'
      });
      await admin.save();
    }

    if (!admin) {
      return res.status(400).json({ message: 'Invalid Admin Credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Admin Credentials' });
    }

    const payload = { admin: { id: admin.id, role: admin.role } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          admin: {
            id: admin.id,
            name: admin.name || 'Admin User',
            email: admin.email,
            phone: admin.phone || '+91 98765 43210',
            role: admin.role || 'Superadmin',
            designation: admin.designation || 'Platform Administrator',
            department: admin.department || 'Operations & Management'
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/admin/profile
// @desc    Get logged in admin profile
router.get('/profile', async (req, res) => {
  try {
    const admin = await getAdminFromRequest(req);
    res.json({
      id: admin.id,
      name: admin.name || 'Admin User',
      email: admin.email,
      phone: admin.phone || '+91 98765 43210',
      role: admin.role || 'Superadmin',
      designation: admin.designation || 'Platform Administrator',
      department: admin.department || 'Operations & Management',
      avatar: admin.avatar || '',
      upiId: admin.upiId || 'biztech@upi',
      createdAt: admin.createdAt
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/admin/profile
// @desc    Update admin profile
router.put('/profile', async (req, res) => {
  try {
    const admin = await getAdminFromRequest(req);
    const { name, phone, email, designation, department, avatar, upiId } = req.body;

    if (name) admin.name = name;
    if (phone) admin.phone = phone;
    if (email) admin.email = email;
    if (designation) admin.designation = designation;
    if (department) admin.department = department;
    if (avatar !== undefined) admin.avatar = avatar;
    if (upiId !== undefined) admin.upiId = upiId.trim();

    await admin.save();

    res.json({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
      designation: admin.designation,
      department: admin.department,
      avatar: admin.avatar,
      upiId: admin.upiId || 'biztech@upi',
      createdAt: admin.createdAt
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/admin/change-password
// @desc    Update admin password
router.put('/change-password', async (req, res) => {
  try {
    const admin = await getAdminFromRequest(req);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/admin/users
// @desc    Get all users (customers) with scale metrics
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({
      accountType: { $nin: ['free_business', 'free_career'] }
    }).sort({ createdAt: -1 });

    const usersWithCounts = await Promise.all(users.map(async (u) => {
      const matchTenant = { $in: [u._id.toString(), u._id] };
      const [brCount, empCount] = await Promise.all([
        Branch.countDocuments({ tenantId: matchTenant }),
        Employee.countDocuments({ tenantId: matchTenant })
      ]);

      const userObj = u.toObject();
      userObj.branchCount = brCount;
      userObj.branchesCount = brCount;
      userObj.employeeCount = empCount;
      userObj.employeesCount = empCount;
      const bizCount = (u.businesses && u.businesses.length > 0)
        ? u.businesses.length
        : (u.businessType === 4 ? 1 : 0);
      userObj.businessCount = bizCount;
      userObj.businessesCount = bizCount;
      return userObj;
    }));

    res.json(usersWithCounts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/admin/directory/verify-business/:id
// @desc    Toggle verified badge for business listing
router.put('/directory/verify-business/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.businessProfile) user.businessProfile = {};
    user.businessProfile.isVerified = !Boolean(user.businessProfile.isVerified);
    await user.save();
    res.json({ message: 'Verification status updated', isVerified: user.businessProfile.isVerified });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update verification' });
  }
});

// @route   PUT /api/admin/directory/toggle-hire-status/:id
// @desc    Toggle hire status for career candidate
router.put('/directory/toggle-hire-status/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.careerProfile) user.careerProfile = {};
    const current = user.careerProfile.isAvailableForHire !== false;
    user.careerProfile.isAvailableForHire = !current;
    await user.save();
    res.json({ message: 'Availability status updated', isAvailableForHire: user.careerProfile.isAvailableForHire });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update availability' });
  }
});

// @route   PUT /api/admin/directory/business/:id
// @desc    Admin updates a business listing
router.put('/directory/business/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const {
      businessName, category, tags, ownerName, contactPhone, whatsappNumber,
      email, address, city, state, pincode, websiteOrSocial, description, isVerified
    } = req.body;

    if (!user.businessProfile) user.businessProfile = {};
    if (businessName !== undefined) user.businessProfile.businessName = businessName;
    if (category !== undefined) user.businessProfile.category = category;
    if (tags !== undefined) {
      user.businessProfile.tags = tags;
      user.tags = tags;
    }
    if (ownerName !== undefined) user.businessProfile.ownerName = ownerName;
    if (contactPhone !== undefined) {
      user.businessProfile.contactPhone = contactPhone;
      user.phone = contactPhone;
    }
    if (whatsappNumber !== undefined) user.businessProfile.whatsappNumber = whatsappNumber;
    if (email !== undefined) {
      user.businessProfile.email = email;
      user.email = email;
    }
    if (address !== undefined) {
      user.businessProfile.address = address;
      user.address = address;
    }
    if (city !== undefined) user.businessProfile.city = city;
    if (state !== undefined) user.businessProfile.state = state;
    if (pincode !== undefined) user.businessProfile.pincode = pincode;
    if (websiteOrSocial !== undefined) user.businessProfile.websiteOrSocial = websiteOrSocial;
    if (description !== undefined) user.businessProfile.description = description;
    if (panNumber !== undefined) user.businessProfile.panNumber = panNumber.trim().toUpperCase();
    if (panProofUrl !== undefined) user.businessProfile.panProofUrl = panProofUrl;
    if (panProofName !== undefined) user.businessProfile.panProofName = panProofName;
    if (isVerified !== undefined) user.businessProfile.isVerified = Boolean(isVerified);

    if (businessName) user.businessName = businessName;
    if (ownerName) user.fullName = ownerName;

    await user.save();
    res.json({ message: 'Business listing updated successfully', user });
  } catch (err) {
    console.error('Error updating business listing by admin:', err);
    res.status(500).json({ message: 'Failed to update business listing' });
  }
});

// @route   PUT /api/admin/directory/career/:id
// @desc    Admin updates a candidate career profile
router.put('/directory/career/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const {
      fullName, jobCategory, skills, experience, expectedSalary, city, currentArea,
      pincode, contactPhone, whatsappNumber, email, availability, employmentType,
      drivingLicense, qualification, bio, isAvailableForHire
    } = req.body;

    if (!user.careerProfile) user.careerProfile = {};
    if (fullName !== undefined) {
      user.careerProfile.fullName = fullName;
      user.fullName = fullName;
    }
    if (jobCategory !== undefined) user.careerProfile.jobCategory = jobCategory;
    if (skills !== undefined) {
      user.careerProfile.skills = skills;
      user.tags = skills;
    }
    if (experience !== undefined) user.careerProfile.experience = experience;
    if (expectedSalary !== undefined) user.careerProfile.expectedSalary = expectedSalary;
    if (city !== undefined) user.careerProfile.city = city;
    if (currentArea !== undefined) user.careerProfile.currentArea = currentArea;
    if (pincode !== undefined) user.careerProfile.pincode = pincode;
    if (contactPhone !== undefined) {
      user.careerProfile.contactPhone = contactPhone;
      user.phone = contactPhone;
    }
    if (whatsappNumber !== undefined) user.careerProfile.whatsappNumber = whatsappNumber;
    if (email !== undefined) {
      user.careerProfile.email = email;
      user.email = email;
    }
    if (availability !== undefined) user.careerProfile.availability = availability;
    if (employmentType !== undefined) user.careerProfile.employmentType = employmentType;
    if (drivingLicense !== undefined) user.careerProfile.drivingLicense = drivingLicense;
    if (qualification !== undefined) user.careerProfile.qualification = qualification;
    if (bio !== undefined) user.careerProfile.bio = bio;
    if (isAvailableForHire !== undefined) user.careerProfile.isAvailableForHire = Boolean(isAvailableForHire);

    await user.save();
    res.json({ message: 'Career profile updated successfully', user });
  } catch (err) {
    console.error('Error updating career profile by admin:', err);
    res.status(500).json({ message: 'Failed to update career profile' });
  }
});

// @route   POST /api/admin/directory/business
// @desc    Admin directly creates a new business directory listing
router.post('/directory/business', async (req, res) => {
  try {
    const {
      businessName,
      ownerName,
      contactPhone,
      whatsappNumber,
      email,
      address,
      city,
      state,
      pincode,
      category,
      tags,
      websiteOrSocial,
      description,
      panNumber,
      panProofUrl,
      panProofName,
      isVerified
    } = req.body;

    if (!businessName || !businessName.trim()) {
      return res.status(400).json({ message: 'Business or Shop name is required.' });
    }

    const cleanPhone = (contactPhone || '').trim().replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ message: 'Valid 10-digit contact phone number is required.' });
    }

    // Clean PAN if provided
    let cleanPan = '';
    if (panNumber && panNumber.trim()) {
      cleanPan = panNumber.trim().toUpperCase();
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(cleanPan)) {
        return res.status(400).json({ message: 'Invalid PAN card format (Must be 5 capital letters, 4 digits, 1 capital letter, e.g. ABCDE1234F).' });
      }

      const existingPan = await User.findOne({
        accountType: 'free_business',
        'businessProfile.panNumber': cleanPan
      });
      if (existingPan) {
        return res.status(400).json({ message: `PAN Card Number (${cleanPan}) is already registered by another business.` });
      }
    }

    // Generate clean email or fallback
    const cleanEmail = email && email.trim() 
      ? email.trim().toLowerCase() 
      : `biz_${cleanPhone}_${Date.now().toString(36)}@directory.biztech.local`;

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(`BizTech@${cleanPhone.slice(-4)}`, salt);
    const candidateUserId = await generateUserId();

    const newUser = new User({
      userId: candidateUserId,
      fullName: ownerName?.trim() || businessName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      businessName: businessName.trim(),
      address: address?.trim() || '',
      streetAddress: address?.trim() || '',
      city: city?.trim() || '',
      state: state?.trim() || '',
      pincode: pincode?.trim() || '',
      tags: Array.isArray(tags) ? tags : [],
      accountType: 'free_business',
      businessType: 1,
      isOnboardingCompleted: true,
      businessProfile: {
        businessName: businessName.trim(),
        ownerName: ownerName?.trim() || '',
        category: category?.trim() || 'Retail',
        tags: Array.isArray(tags) ? tags : [],
        contactPhone: cleanPhone,
        whatsappNumber: whatsappNumber?.trim() || cleanPhone,
        email: cleanEmail,
        address: address?.trim() || '',
        city: city?.trim() || '',
        state: state?.trim() || '',
        pincode: pincode?.trim() || '',
        websiteOrSocial: websiteOrSocial?.trim() || '',
        description: description?.trim() || '',
        panNumber: cleanPan,
        panProofUrl: panProofUrl || '',
        panProofName: panProofName || '',
        isVerified: Boolean(isVerified)
      }
    });

    await newUser.save();
    res.status(201).json({ message: 'Business listing created successfully', business: newUser });
  } catch (err) {
    console.error('Error creating business listing by admin:', err);
    res.status(500).json({ message: 'Failed to create business listing' });
  }
});

// @route   POST /api/admin/directory/career
// @desc    Admin directly creates a new candidate career profile
router.post('/directory/career', async (req, res) => {
  try {
    const {
      fullName,
      jobCategory,
      experience,
      contactPhone,
      whatsappNumber,
      email,
      city,
      currentArea,
      pincode,
      qualification,
      employmentType,
      availability,
      expectedSalary,
      drivingLicense,
      skills,
      bio,
      isAvailableForHire
    } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ message: 'Candidate full name is required.' });
    }

    const cleanPhone = (contactPhone || '').trim().replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ message: 'Valid 10-digit contact phone number is required.' });
    }

    const cleanEmail = email && email.trim()
      ? email.trim().toLowerCase()
      : `career_${cleanPhone}_${Date.now().toString(36)}@directory.biztech.local`;

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'A candidate with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(`Career@${cleanPhone.slice(-4)}`, salt);
    const candidateUserId = await generateUserId();

    const newUser = new User({
      userId: candidateUserId,
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      city: city?.trim() || '',
      tags: Array.isArray(skills) ? skills : [],
      accountType: 'free_career',
      isOnboardingCompleted: true,
      careerProfile: {
        fullName: fullName.trim(),
        jobCategory: jobCategory?.trim() || 'General Work',
        skills: Array.isArray(skills) ? skills : [],
        experience: experience?.trim() || 'Fresher',
        expectedSalary: expectedSalary?.trim() || 'Negotiable',
        city: city?.trim() || '',
        currentArea: currentArea?.trim() || '',
        pincode: pincode?.trim() || '',
        contactPhone: cleanPhone,
        whatsappNumber: whatsappNumber?.trim() || cleanPhone,
        email: cleanEmail,
        availability: availability?.trim() || 'Immediate',
        employmentType: employmentType?.trim() || 'Full-time',
        drivingLicense: drivingLicense?.trim() || 'None',
        qualification: qualification?.trim() || '',
        bio: bio?.trim() || '',
        isAvailableForHire: isAvailableForHire !== false
      }
    });

    await newUser.save();
    res.status(201).json({ message: 'Candidate career profile created successfully', candidate: newUser });
  } catch (err) {
    console.error('Error creating career candidate by admin:', err);
    res.status(500).json({ message: 'Failed to create candidate profile' });
  }
});

// @route   POST /api/admin/create-customer
// @desc    Admin creates and fully onboards a customer across all 7 steps (no payment gateway needed)
router.post('/create-customer', async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      businessName,
      brandName,
      ownerName,
      businessEmail,
      businessPhone,
      panNumber,
      gstNumber,
      streetAddress,
      city,
      state,
      pincode,
      address,
      offeringType,
      businessOfferingType,
      operationsType,
      businessOperationsType,
      modules,
      category,
      categories,
      subCategory,
      catalogueData,
      documents,
      businessType,
      subscription
    } = req.body;

    // 1. Validation
    if (!fullName || !email || !phone || !password || !businessName || !panNumber) {
      return res.status(400).json({ 
        message: 'Please provide all mandatory fields: Full Name, Email, Phone, Password, Business Name, and PAN Card Number.' 
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailCheck = await checkEmailInUse(cleanEmail);
    if (emailCheck.taken) {
      return res.status(400).json({ message: emailCheck.message || 'Email is already registered across an existing account.' });
    }

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
    }
    const phoneCheck = await checkPhoneInUse(cleanPhone);
    if (phoneCheck.taken) {
      return res.status(400).json({ message: phoneCheck.message || 'Phone number is already registered across an existing account.' });
    }

    const cleanPan = panNumber.trim().toUpperCase();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(cleanPan)) {
      return res.status(400).json({ message: 'Invalid PAN card format (Must be 5 capital letters, 4 digits, 1 capital letter, e.g. ABCDE1234F).' });
    }

    const existingPanUser = await User.findOne({
      $or: [
        { panNumber: cleanPan },
        { 'documents.pan': cleanPan },
        { 'businesses.panNumber': cleanPan }
      ]
    });
    if (existingPanUser) {
      return res.status(400).json({ message: `PAN Card Number (${cleanPan}) is already registered with another business. Please use a unique PAN.` });
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. User ID & Limits
    const targetTypeNum = Number(businessType) || 1;
    let initialEmployeeLimit = null;
    let initialBranchLimit = null;
    let initialBusinessLimit = null;
    const planDoc = await Pricing.findOne({ customerType: { $regex: new RegExp('Type ' + targetTypeNum, 'i') } });
    if (planDoc) {
      if (planDoc.employeeLimit !== undefined && planDoc.employeeLimit !== null) initialEmployeeLimit = planDoc.employeeLimit;
      if (planDoc.branchLimit !== undefined && planDoc.branchLimit !== null) initialBranchLimit = planDoc.branchLimit;
      if (planDoc.businessLimit !== undefined && planDoc.businessLimit !== null) initialBusinessLimit = planDoc.businessLimit;
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

    const newUserId = await generateUserId();
    const resolvedOffering = offeringType || businessOfferingType || 'product';
    const resolvedOperations = operationsType || businessOperationsType || 'purchases';

    const fullAddress = address || [streetAddress, city, state, pincode].filter(Boolean).join(', ');

    // 4. Default & Chosen Modules
    const chosenModules = (modules && Array.isArray(modules) && modules.length > 0)
      ? Array.from(new Set([...modules, 'sales']))
      : ['sales', 'products_services', 'expenses', 'documents', 'reminders', 'customers', ...(resolvedOffering !== 'service' ? ['inventory'] : []), ...(resolvedOperations !== 'billing_only' ? ['purchases'] : [])];

    // 5. Subscription Setup (Active immediately, no payment needed from admin side)
    const validUntil = new Date();
    if (subscription?.billingCycle === 'Annual') {
      validUntil.setFullYear(validUntil.getFullYear() + 1);
    } else {
      validUntil.setMonth(validUntil.getMonth() + 1);
    }

    const userObj = new User({
      fullName,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      userId: newUserId,
      businessType: targetTypeNum,
      isOnboardingCompleted: true,
      subscriptionStatus: 'Active',
      businessName: businessName.trim(),
      ownerName: (ownerName || fullName).trim(),
      panNumber: cleanPan,
      gstNumber: (gstNumber || '').trim().toUpperCase(),
      businessPhone: businessPhone || cleanPhone,
      streetAddress: streetAddress || '',
      city: city || '',
      state: state || '',
      pincode: pincode || '',
      address: fullAddress,
      offeringType: resolvedOffering,
      businessOfferingType: resolvedOffering,
      category: category || (categories && categories[0]) || '',
      categories: categories || (category ? [category] : []),
      subCategory: subCategory || '',
      modules: chosenModules,
      employeeLimit: initialEmployeeLimit,
      branchLimit: initialBranchLimit,
      businessLimit: initialBusinessLimit,
      subscriptionBillingCycle: subscription?.billingCycle || 'Monthly',
      subscriptionRenewalDate: validUntil,
      documents: {
        pan: cleanPan,
        panType: 'ID Card',
        panFileUrl: documents?.panFileUrl || '',
        panFileName: documents?.panFileName || '',
        gstin: (gstNumber || '').trim().toUpperCase(),
        gstinType: 'Certificate',
        gstinFileUrl: documents?.gstinFileUrl || '',
        gstinFileName: documents?.gstinFileName || '',
        msme: documents?.msme || '',
        msmeType: 'Registration',
        msmeFileUrl: documents?.msmeFileUrl || '',
        msmeFileName: documents?.msmeFileName || '',
        customDocuments: documents?.customDocuments || []
      },
      subscription: {
        planId: subscription?.planId || `type_${targetTypeNum}`,
        planName: subscription?.planName || `Type ${targetTypeNum} Plan`,
        amount: subscription?.amount || 0,
        billingCycle: subscription?.billingCycle || 'Monthly',
        paymentMethod: 'Admin Direct',
        paymentStatus: 'Active',
        transactionId: `ADMIN-ACT-${Date.now()}`,
        startDate: new Date(),
        validUntil: validUntil
      }
    });

    // 6. If businessType is 4 or multi-business, add primary business record
    if (targetTypeNum >= 3) {
      const bizId = generateNextBusinessId([]);
      userObj.businesses = [{
        businessId: bizId,
        businessCode: bizId,
        name: businessName,
        category: category || (categories && categories[0]) || '',
        categories: categories || (category ? [category] : []),
        contactPerson: fullName,
        email: businessEmail || cleanEmail,
        phone: businessPhone || cleanPhone,
        address: fullAddress,
        streetAddress: streetAddress || '',
        city: city || '',
        state: state || '',
        pincode: pincode || '',
        panNumber: cleanPan,
        gstNumber: (gstNumber || '').trim().toUpperCase(),
        ownerName: (ownerName || fullName).trim(),
        offeringType: resolvedOffering,
        operationsType: resolvedOperations === 'billing_only' ? 'sales' : 'both',
        isLoginEnabled: true
      }];
    }

    const savedUser = await userObj.save();

    // 7. Seed Default Primary Branch
    try {
      const branchId = await generateNextBranchId(savedUser._id);
      await Branch.create({
        tenantId: savedUser._id,
        branchId,
        branchCode: branchId,
        name: 'Main Branch / HQ',
        location: fullAddress || city || 'Headquarters',
        type: 'Store',
        manager: fullName,
        contactNumber: cleanPhone,
        businessName: businessName
      });
    } catch (brErr) {
      console.error('Error creating default branch for admin new customer:', brErr);
    }

    // 8. Sync Documents to Document Collection
    try {
      const docsToSync = [];
      if (cleanPan) {
        docsToSync.push({
          title: 'Business PAN Card',
          type: 'PAN Card',
          documentNumber: cleanPan,
          fileUrl: documents?.panFileUrl || '',
          fileName: documents?.panFileName || ''
        });
      }
      if (gstNumber) {
        docsToSync.push({
          title: 'GST Registration Certificate',
          type: 'GST Certificate',
          documentNumber: gstNumber.trim().toUpperCase(),
          fileUrl: documents?.gstinFileUrl || '',
          fileName: documents?.gstinFileName || ''
        });
      }
      if (documents?.customDocuments && Array.isArray(documents.customDocuments)) {
        for (const cd of documents.customDocuments) {
          if (!cd.name && !cd.number) continue;
          docsToSync.push({
            title: cd.name || 'Business Verification Document',
            type: cd.type || 'Registration',
            documentNumber: cd.number || '',
            fileUrl: cd.fileUrl || '',
            fileName: cd.fileName || ''
          });
        }
      }

      for (const item of docsToSync) {
        await Document.create({
          tenantId: savedUser._id,
          title: item.title,
          type: item.type,
          documentNumber: item.documentNumber,
          fileUrl: item.fileUrl,
          fileName: item.fileName
        });
      }
    } catch (docErr) {
      console.error('Error syncing documents to Document collection:', docErr);
    }

    // 9. Auto-seed Catalogue
    try {
      await seedCatalogueFromUser(savedUser._id, catalogueData);
    } catch (catErr) {
      console.error('Error auto-seeding catalogue for admin new customer:', catErr);
    }

    res.status(201).json({
      success: true,
      message: 'Customer registered, fully onboarded, and activated successfully!',
      user: savedUser
    });
  } catch (err) {
    console.error('Admin create customer error:', err);
    res.status(500).json({ message: err.message || 'Server error while creating customer' });
  }
});

// @route   GET /api/admin/users/:id/details
// @desc    Get complete customer data (profile, branches, staff, businesses, expenses, sales, inventory, customers)
router.get('/users/:id/details', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const tenantIdStr = user._id.toString();
    const tenantIdObj = user._id;
    const matchTenant = { $in: [tenantIdStr, tenantIdObj] };

    const [
      branches,
      employees,
      customers,
      inventory,
      products,
      sales,
      expenses,
      purchases,
      attendance,
      leaves,
      reminders,
      documents,
      categories,
      subcategories,
      investors
    ] = await Promise.all([
      Branch.find({ tenantId: matchTenant }).select('-password').sort({ createdAt: -1 }),
      Employee.find({ tenantId: matchTenant }).select('-password').sort({ createdAt: -1 }),
      Customer.find({ tenantId: matchTenant }).sort({ createdAt: -1 }),
      Inventory.find({ tenantId: matchTenant }).populate('productId', 'name sku price stock image itemType costPrice unit measurementType secondaryUnit conversionFactor').sort({ createdAt: -1 }),
      Product.find({ tenantId: matchTenant }).populate('categoryId', 'name itemType transactionType').populate('subCategoryId', 'name itemType transactionType').sort({ createdAt: -1 }),
      Sale.find({ tenantId: matchTenant }).sort({ createdAt: -1 }),
      Expense.find({ tenantId: matchTenant }).sort({ createdAt: -1 }),
      Purchase.find({ tenantId: matchTenant }).sort({ createdAt: -1 }),
      Attendance.find({ tenantId: matchTenant }).populate('employeeId', 'name email position').sort({ date: -1 }),
      Leave.find({ tenantId: matchTenant }).populate('employeeId', 'name email position').sort({ createdAt: -1 }),
      Reminder.find({ tenantId: matchTenant }).sort({ date: -1 }),
      Document.find({ tenantId: matchTenant }).sort({ createdAt: -1 }),
      Category.find({ tenantId: matchTenant }).sort({ createdAt: -1 }),
      SubCategory.find({ tenantId: matchTenant }).populate('categoryId', 'name itemType transactionType').sort({ createdAt: -1 }),
      Investor.find({ tenantId: matchTenant }).select('-password').sort({ createdAt: -1 })
    ]);

    let finalCategories = categories || [];
    let finalSubcategories = subcategories || [];

    // If customer has no categories yet, auto-seed from their onboarding profile
    if (finalCategories.length === 0 && (user.categories?.length > 0 || user.category)) {
      try {
        await seedCatalogueFromUser(user._id);
        finalCategories = await Category.find({ tenantId: matchTenant }).sort({ createdAt: -1 });
        finalSubcategories = await SubCategory.find({ tenantId: matchTenant }).populate('categoryId', 'name itemType transactionType').sort({ createdAt: -1 });
      } catch (seedErr) {
        console.error('Error auto-seeding categories in admin customer details:', seedErr);
      }
    }

    const totalSalesAmount = sales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    const totalExpensesAmount = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const totalPurchasesAmount = purchases.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // Generate user impersonation token (optional fallback)
    const payload = {
      user: {
        id: user.id,
        businessType: user.businessType,
        role: 'owner',
        impersonatedByAdmin: true
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    res.json({
      user: {
        _id: user._id,
        id: user._id.toString().substring(user._id.toString().length - 6).toUpperCase(),
        userId: user.userId || `BT-${user._id.toString().substring(user._id.toString().length - 4)}`,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        businessName: user.businessName || `${user.fullName}'s Business`,
        businessLogo: user.businessLogo || '',
        workspaceTemplate: user.workspaceTemplate || 'none',
        businessType: user.businessType || 1,
        industry: user.industry || 'Not specified',
        address: user.address || 'Not specified',
        regNo: user.regNo || 'N/A',
        businessPhone: user.businessPhone || user.phone || 'N/A',
        createdAt: user.createdAt,
        modules: user.modules || [],
        offeringType: user.offeringType || 'product',
        businessOfferingType: user.businessOfferingType || user.offeringType || 'product',
        operationsType: user.operationsType || 'purchases',
        businessOperationsType: user.businessOperationsType || user.operationsType || 'purchases',
        businesses: user.businesses || [],
        subscriptionStatus: user.subscriptionStatus || 'Active',
        subscriptionBillingCycle: user.subscriptionBillingCycle || 'Monthly',
        subscriptionRenewalDate: user.subscriptionRenewalDate,
        subscriptionCustomAmount: user.subscriptionCustomAmount,
        employeeLimit: user.employeeLimit ?? null,
        branchLimit: user.branchLimit ?? null,
        businessLimit: user.businessLimit ?? null
      },
      branches: branches || [],
      employees: employees || [],
      businesses: user.businesses || [],
      customers: customers || [],
      inventory: inventory || [],
      products: products || [],
      sales: sales || [],
      expenses: expenses || [],
      purchases: purchases || [],
      attendance: attendance || [],
      leaves: leaves || [],
      reminders: reminders || [],
      documents: documents || [],
      categories: finalCategories || [],
      subcategories: finalSubcategories || [],
      investors: investors || [],
      financials: {
        totalSales: totalSalesAmount,
        totalExpenses: totalExpensesAmount,
        totalPurchases: totalPurchasesAmount,
        netProfit: totalSalesAmount - totalExpensesAmount
      },
      counts: {
        branches: branches ? branches.length : 0,
        employees: employees ? employees.length : 0,
        businesses: (user.businesses && user.businesses.length > 0) ? user.businesses.length : 1,
        customers: customers ? customers.length : 0,
        inventory: inventory ? inventory.length : 0,
        products: products ? products.filter(p => (p.itemType || p.categoryId?.itemType)?.toLowerCase() !== 'service').length : 0,
        services: products ? products.filter(p => (p.itemType || p.categoryId?.itemType)?.toLowerCase() === 'service').length : 0,
        sales: sales ? sales.length : 0,
        expenses: expenses ? expenses.length : 0,
        purchases: purchases ? purchases.length : 0,
        attendance: attendance ? attendance.length : 0,
        leaves: leaves ? leaves.length : 0,
        reminders: reminders ? reminders.length : 0,
        documents: documents ? documents.length : 0,
        categories: finalCategories ? finalCategories.length : 0,
        subcategories: finalSubcategories ? finalSubcategories.length : 0,
        investors: investors ? investors.length : 0
      },
      impersonationToken: token
    });
  } catch (err) {
    console.error('Error fetching customer details:', err);
    res.status(500).json({ message: 'Server error fetching user details' });
  }
});

// @route   POST /api/admin/impersonate/:id
// @desc    Impersonate a tenant (generates user session token for admin)
router.post('/impersonate/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const payload = {
      user: {
        id: user.id,
        businessType: user.businessType,
        role: 'owner',
        impersonatedByAdmin: true
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            _id: user.id,
            name: user.fullName || user.businessName,
            businessName: user.businessName,
            email: user.email,
            phone: user.phone,
            businessType: user.businessType,
            modules: user.modules || [],
            userId: user.userId
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Helper for default pricing amounts by type
const getDefaultPriceForType = (type) => {
  switch (Number(type)) {
    case 1: return 499;
    case 2: return 999;
    case 3: return 1999;
    case 4: return 3499;
    default: return 499;
  }
};

// @route   GET /api/admin/subscriptions
// @desc    Get all tenant subscriptions with stats
router.get('/subscriptions', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const pricingPlans = await Pricing.find();

    const planPriceMap = {};
    pricingPlans.forEach(p => {
      planPriceMap[p.customerType] = p.amount;
    });

    let totalActive = 0;
    let totalMrr = 0;
    let expiringSoonCount = 0;
    const typeDistribution = { 1: 0, 2: 0, 3: 0, 4: 0 };

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const subscriptions = users.map(user => {
      const type = user.businessType || 1;
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;

      // Base amount calculation
      const baseTypeKey = `Type ${type}`;
      const matchedPlanKey = Object.keys(planPriceMap).find(k => k.includes(String(type)));
      const baseAmount = matchedPlanKey ? planPriceMap[matchedPlanKey] : getDefaultPriceForType(type);
      const amount = user.subscriptionCustomAmount !== undefined && user.subscriptionCustomAmount !== null 
        ? user.subscriptionCustomAmount 
        : baseAmount;

      const status = user.subscriptionStatus || 'Active';
      if (status === 'Active') {
        totalActive += 1;
        totalMrr += Number(amount);
      }

      // Renewal date: prioritize subscriptionRenewalDate or validUntil
      let renewalDate = user.subscriptionRenewalDate || user.subscription?.validUntil;
      if (!renewalDate) {
        const created = new Date(user.createdAt || Date.now());
        const candidate = new Date(created);
        candidate.setMonth(candidate.getMonth() + 1);
        while (candidate < now) {
          candidate.setMonth(candidate.getMonth() + 1);
        }
        renewalDate = candidate;
      } else {
        renewalDate = new Date(renewalDate);
      }

      const daysUntilRenewal = Math.ceil((renewalDate - now) / (1000 * 60 * 60 * 24));
      if (daysUntilRenewal >= 0 && daysUntilRenewal <= 7 && status === 'Active') {
        expiringSoonCount += 1;
      }

      return {
        _id: user._id,
        id: user._id.toString().substring(user._id.toString().length - 6).toUpperCase(),
        userId: user.userId || `BT-${user._id.toString().substring(user._id.toString().length - 4)}`,
        businessName: user.businessName || `${user.fullName}'s Business`,
        contactName: user.fullName,
        contactEmail: user.email,
        contactPhone: user.phone || 'N/A',
        type,
        typeLabel: `Type ${type}: ${type === 1 ? 'Sole Operator' : type === 2 ? 'Single Branch + Staff' : type === 3 ? 'Multi-Branch Enterprise' : 'Multi-Business Conglomerate'}`,
        billingCycle: user.subscriptionBillingCycle || 'Monthly',
        amount: Number(amount),
        status,
        startDate: user.createdAt,
        renewalDate,
        daysUntilRenewal,
        modules: user.modules || [],
        employeeLimit: user.employeeLimit ?? null,
        branchLimit: user.branchLimit ?? null,
        businessLimit: user.businessLimit ?? null
      };
    });

    res.json({
      subscriptions,
      stats: {
        totalActive,
        totalTenants: users.length,
        totalMrr,
        expiringSoonCount,
        typeDistribution
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/admin/dashboard-stats
// @desc    Get real-time dynamic dashboard statistics
router.get('/dashboard-stats', async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

    const [
      users,
      pricingPlans,
      totalEmployees,
      totalBranches,
      totalProducts,
      salesAgg,
      recentUsers
    ] = await Promise.all([
      User.find().select('businessType subscriptionStatus subscriptionCustomAmount createdAt businesses fullName businessName email phone city userId'),
      Pricing.find(),
      Employee.countDocuments(),
      Branch.countDocuments(),
      Product.countDocuments(),
      Sale.aggregate([
        { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      User.find().sort({ createdAt: -1 }).limit(6).lean()
    ]);

    const planPriceMap = {};
    pricingPlans.forEach(p => {
      planPriceMap[p.customerType] = p.amount;
    });

    let totalActive = 0;
    let totalPending = 0;
    let totalMrr = 0;
    let newThisMonth = 0;
    let newLastMonth = 0;
    const typeCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    let totalBusinesses = 0;

    users.forEach(u => {
      const type = u.businessType || 1;
      typeCounts[type] = (typeCounts[type] || 0) + 1;

      if (u.businesses && Array.isArray(u.businesses)) {
        totalBusinesses += u.businesses.length;
      }

      const status = u.subscriptionStatus || 'Active';
      if (status === 'Active') {
        totalActive += 1;
        const matchedPlanKey = Object.keys(planPriceMap).find(k => k.includes(String(type)));
        const baseAmount = matchedPlanKey ? planPriceMap[matchedPlanKey] : getDefaultPriceForType(type);
        const amount = u.subscriptionCustomAmount !== undefined && u.subscriptionCustomAmount !== null
          ? Number(u.subscriptionCustomAmount)
          : Number(baseAmount);
        totalMrr += isNaN(amount) ? 0 : amount;
      } else if (status === 'Pending') {
        totalPending += 1;
      }

      const created = new Date(u.createdAt);
      if (created >= thirtyDaysAgo) {
        newThisMonth += 1;
      } else if (created >= sixtyDaysAgo && created < thirtyDaysAgo) {
        newLastMonth += 1;
      }
    });

    const totalTenants = users.length;
    let growthRate = 0;
    if (newLastMonth > 0) {
      growthRate = Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100);
    } else if (newThisMonth > 0) {
      growthRate = 100;
    }

    const totalSalesVolume = salesAgg.length > 0 ? (salesAgg[0].totalAmount || 0) : 0;
    const totalSalesCount = salesAgg.length > 0 ? (salesAgg[0].count || 0) : 0;

    // Attach scale (employee count, branch count, business count) to recent users
    const recentTenantsWithScale = await Promise.all(recentUsers.map(async (ru) => {
      const match = { $in: [ru._id.toString(), ru._id] };
      const [empCount, brCount] = await Promise.all([
        Employee.countDocuments({ tenantId: match }),
        Branch.countDocuments({ tenantId: match })
      ]);
      return {
        _id: ru._id,
        userId: ru.userId || `BT-${ru._id.toString().substring(ru._id.toString().length - 4).toUpperCase()}`,
        businessName: ru.businessName || `${ru.fullName}'s Business`,
        fullName: ru.fullName,
        email: ru.email,
        phone: ru.phone || 'N/A',
        city: ru.city || 'N/A',
        businessType: ru.businessType || 1,
        subscriptionStatus: ru.subscriptionStatus || 'Active',
        createdAt: ru.createdAt,
        employeeCount: empCount,
        branchCount: brCount,
        businessCount: ru.businesses?.length || (ru.businessType === 4 ? 1 : 0)
      };
    }));

    res.json({
      overview: {
        totalTenants,
        totalActive,
        totalPending,
        newThisMonth,
        growthRate,
        totalMrr,
        totalArr: totalMrr * 12,
        arpu: totalTenants > 0 ? Math.round(totalMrr / totalTenants) : 0
      },
      tierDistribution: {
        typeCounts,
        percentages: {
          1: totalTenants > 0 ? Math.round((typeCounts[1] / totalTenants) * 100) : 0,
          2: totalTenants > 0 ? Math.round((typeCounts[2] / totalTenants) * 100) : 0,
          3: totalTenants > 0 ? Math.round((typeCounts[3] / totalTenants) * 100) : 0,
          4: totalTenants > 0 ? Math.round((typeCounts[4] / totalTenants) * 100) : 0
        }
      },
      platformScale: {
        totalEmployees,
        totalBranches,
        totalBusinesses,
        totalProducts,
        totalSalesCount,
        totalSalesVolume
      },
      systemTelemetry: {
        status: 'Operational',
        database: 'Connected',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date()
      },
      recentCustomers: recentTenantsWithScale
    });
  } catch (err) {
    console.error('Error fetching admin dashboard stats:', err);
    res.status(500).json({ message: 'Server error fetching dashboard statistics' });
  }
});

// @route   PUT /api/admin/subscriptions/:id
// @desc    Update a tenant subscription
router.put('/subscriptions/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { status, businessType, billingCycle, customAmount, renewalDate, remainingDays, employeeLimit, branchLimit, businessLimit } = req.body;

    if (businessType !== undefined) user.businessType = Number(businessType);
    if (billingCycle) {
      user.subscriptionBillingCycle = billingCycle;
      if (!user.subscription) user.subscription = {};
      user.subscription.billingCycle = billingCycle;
    }
    if (customAmount !== undefined) {
      user.subscriptionCustomAmount = Number(customAmount);
      if (!user.subscription) user.subscription = {};
      user.subscription.amount = Number(customAmount);
    }

    // Determine target renewal date from renewalDate or remainingDays
    let targetRenewalDate = null;
    if (renewalDate) {
      targetRenewalDate = new Date(renewalDate);
    } else if (remainingDays !== undefined && remainingDays !== null && remainingDays !== '') {
      const now = new Date();
      targetRenewalDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + Number(remainingDays), 23, 59, 59);
    }

    if (targetRenewalDate && !isNaN(targetRenewalDate.getTime())) {
      user.subscriptionRenewalDate = targetRenewalDate;
      if (!user.subscription) user.subscription = {};
      user.subscription.validUntil = targetRenewalDate;
    }

    // Handle status update
    if (status) {
      user.subscriptionStatus = status;
      if (!user.subscription) user.subscription = {};
      user.subscription.paymentStatus = status;
    } else if (targetRenewalDate) {
      const now = new Date();
      if (targetRenewalDate > now) {
        user.subscriptionStatus = 'Active';
        if (!user.subscription) user.subscription = {};
        user.subscription.paymentStatus = 'Active';
      } else {
        user.subscriptionStatus = 'Expired';
        if (!user.subscription) user.subscription = {};
        user.subscription.paymentStatus = 'Expired';
      }
    }

    if (employeeLimit !== undefined) {
      user.employeeLimit = (employeeLimit === '' || employeeLimit === null || Number(employeeLimit) === 0) ? null : Number(employeeLimit);
    }
    if (branchLimit !== undefined) {
      user.branchLimit = (branchLimit === '' || branchLimit === null || Number(branchLimit) === 0) ? null : Number(branchLimit);
    }
    if (businessLimit !== undefined) {
      user.businessLimit = (businessLimit === '' || businessLimit === null || Number(businessLimit) === 0) ? null : Number(businessLimit);
    }

    await user.save();

    const now = new Date();
    const effectiveRenewalDate = user.subscriptionRenewalDate || user.subscription?.validUntil;
    const computedDays = effectiveRenewalDate 
      ? Math.ceil((new Date(effectiveRenewalDate) - now) / (1000 * 60 * 60 * 24)) 
      : 0;

    res.json({
      message: 'Subscription updated successfully',
      user: {
        _id: user._id,
        subscriptionStatus: user.subscriptionStatus,
        businessType: user.businessType,
        subscriptionBillingCycle: user.subscriptionBillingCycle,
        subscriptionCustomAmount: user.subscriptionCustomAmount,
        subscriptionRenewalDate: user.subscriptionRenewalDate,
        validUntil: user.subscription?.validUntil,
        daysUntilRenewal: computedDays,
        employeeLimit: user.employeeLimit ?? null,
        branchLimit: user.branchLimit ?? null,
        businessLimit: user.businessLimit ?? null
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ==========================================
// ADMIN DIRECT CRUD ENDPOINTS FOR TENANT DATA
// ==========================================

// --- USER PROFILE UPDATE ---
router.put('/users/:id', async (req, res) => {
  try {
    const { 
      fullName, businessName, email, phone, industry, 
      address, regNo, businessPhone, subscriptionStatus, 
      subscriptionBillingCycle, subscriptionCustomAmount,
      password, employeeLimit, branchLimit, businessLimit,
      modules, offeringType, businessOfferingType, operationsType, businessOperationsType, businessType,
      businessLogo, workspaceTemplate
    } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (fullName !== undefined) user.fullName = fullName;
    if (businessName !== undefined) user.businessName = businessName;
    if (businessLogo !== undefined) user.businessLogo = businessLogo;
    if (workspaceTemplate !== undefined) user.workspaceTemplate = workspaceTemplate;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (industry !== undefined) user.industry = industry;
    if (address !== undefined) user.address = address;
    if (regNo !== undefined) user.regNo = regNo;
    if (businessPhone !== undefined) user.businessPhone = businessPhone;
    if (subscriptionStatus !== undefined) user.subscriptionStatus = subscriptionStatus;
    if (subscriptionBillingCycle !== undefined) user.subscriptionBillingCycle = subscriptionBillingCycle;
    if (subscriptionCustomAmount !== undefined) user.subscriptionCustomAmount = Number(subscriptionCustomAmount);
    if (businessType !== undefined && businessType !== null) {
      user.businessType = Number(businessType);
    }
    if (modules !== undefined && Array.isArray(modules)) {
      // Billing ('sales') is permanent and mandatory across all user logins
      const sanitizedModules = Array.from(new Set([...modules, 'sales']));
      user.modules = sanitizedModules;
    }
    if (offeringType !== undefined) {
      user.offeringType = offeringType;
      user.businessOfferingType = offeringType;
    }
    if (businessOfferingType !== undefined) {
      user.businessOfferingType = businessOfferingType;
      user.offeringType = businessOfferingType;
    }
    if (operationsType !== undefined) {
      user.operationsType = operationsType;
      user.businessOperationsType = operationsType;
    }
    if (businessOperationsType !== undefined) {
      user.businessOperationsType = businessOperationsType;
      user.operationsType = businessOperationsType;
    }
    if (employeeLimit !== undefined) {
      user.employeeLimit = (employeeLimit === '' || employeeLimit === null || Number(employeeLimit) === 0) ? null : Number(employeeLimit);
    }
    if (branchLimit !== undefined) {
      user.branchLimit = (branchLimit === '' || branchLimit === null || Number(branchLimit) === 0) ? null : Number(branchLimit);
    }
    if (businessLimit !== undefined) {
      user.businessLimit = (businessLimit === '' || businessLimit === null || Number(businessLimit) === 0) ? null : Number(businessLimit);
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    console.error('Admin update user error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

router.put('/users/:id/credentials', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (email) user.email = email.trim().toLowerCase();
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    await user.save();
    res.json({ message: 'User credentials updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- BRANCHES CRUD ---
router.put('/branches/:id', async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });

    const updateData = { ...req.body };
    if (updateData.branchId !== undefined || updateData.branchCode !== undefined) {
      const cleanBranchId = (updateData.branchId || updateData.branchCode || '').trim();
      if (!cleanBranchId) {
        return res.status(400).json({ message: 'Branch ID cannot be empty.' });
      }
      const duplicateBranch = await Branch.findOne({
        tenantId: branch.tenantId,
        _id: { $ne: req.params.id },
        $or: [
          { branchId: { $regex: new RegExp(`^${escapeRegex(cleanBranchId)}$`, 'i') } },
          { branchCode: { $regex: new RegExp(`^${escapeRegex(cleanBranchId)}$`, 'i') } }
        ]
      });
      if (duplicateBranch) {
        return res.status(400).json({
          message: `Branch ID "${cleanBranchId}" is already assigned to branch "${duplicateBranch.name}". Please use a unique Branch ID.`
        });
      }
      updateData.branchId = cleanBranchId;
      updateData.branchCode = cleanBranchId;
    }

    if (updateData.password) {
      if (updateData.password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    const updated = await Branch.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/branches/:id/credentials', async (req, res) => {
  try {
    const { email, password, isLoginEnabled } = req.body;
    const branch = await Branch.findById(req.params.id);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });

    if (email) branch.email = email.trim().toLowerCase();
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
      const salt = await bcrypt.genSalt(10);
      branch.password = await bcrypt.hash(password, salt);
    }
    if (typeof isLoginEnabled === 'boolean') {
      branch.isLoginEnabled = isLoginEnabled;
    }
    await branch.save();
    const result = branch.toObject();
    delete result.password;
    res.json({ message: 'Branch credentials updated successfully', branch: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/branches/:id', async (req, res) => {
  try {
    const deleted = await Branch.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Branch not found' });
    res.json({ message: 'Branch deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- EMPLOYEES CRUD ---
router.put('/employees/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const updateData = { ...req.body };
    if (updateData.employeeId !== undefined) {
      const cleanEmployeeId = (updateData.employeeId || '').trim();
      if (!cleanEmployeeId) {
        return res.status(400).json({ message: 'Employee ID cannot be empty.' });
      }
      const duplicateEmp = await Employee.findOne({
        tenantId: employee.tenantId,
        _id: { $ne: req.params.id },
        employeeId: { $regex: new RegExp(`^${escapeRegex(cleanEmployeeId)}$`, 'i') }
      });
      if (duplicateEmp) {
        return res.status(400).json({
          message: `Employee ID "${cleanEmployeeId}" is already assigned to employee "${duplicateEmp.name}". Please use a unique Employee ID.`
        });
      }
      updateData.employeeId = cleanEmployeeId;
    }

    if (updateData.password) {
      if (updateData.password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/employees/:id/credentials', async (req, res) => {
  try {
    const { email, password, isLoginEnabled } = req.body;
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    if (email) employee.email = email.trim().toLowerCase();
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
      const salt = await bcrypt.genSalt(10);
      employee.password = await bcrypt.hash(password, salt);
    }
    if (typeof isLoginEnabled === 'boolean') {
      employee.isLoginEnabled = isLoginEnabled;
    }
    await employee.save();
    const result = employee.toObject();
    delete result.password;
    res.json({ message: 'Employee credentials updated successfully', employee: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/employees/:id', async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- BUSINESSES CRUD (Multi-business conglomerate) ---
router.put('/businesses/:userId/:bizId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const biz = user.businesses.id(req.params.bizId);
    if (!biz) return res.status(404).json({ message: 'Business not found' });

    const updateData = { ...req.body };
    if (updateData.businessId !== undefined || updateData.businessCode !== undefined) {
      const cleanBizId = (updateData.businessId || updateData.businessCode || '').trim();
      if (!cleanBizId) {
        return res.status(400).json({ message: 'Business ID cannot be empty.' });
      }
      const duplicateBiz = (user.businesses || []).find(b => {
        if (b._id.toString() === req.params.bizId) return false;
        const bId = (b.businessId || b.businessCode || '').trim();
        return bId.toLowerCase() === cleanBizId.toLowerCase();
      });
      if (duplicateBiz) {
        return res.status(400).json({
          message: `Business ID "${cleanBizId}" is already assigned to business "${duplicateBiz.name}". Please use a unique Business ID.`
        });
      }
      updateData.businessId = cleanBizId;
      updateData.businessCode = cleanBizId;
    }

    if (updateData.password) {
      if (updateData.password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    Object.assign(biz, updateData);
    await user.save();
    res.json({ message: 'Business updated successfully', business: biz });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/businesses/:userId/:bizId/credentials', async (req, res) => {
  try {
    const { email, password, isLoginEnabled } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const biz = user.businesses.id(req.params.bizId);
    if (!biz) return res.status(404).json({ message: 'Business not found' });

    if (email) biz.email = email.trim().toLowerCase();
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
      const salt = await bcrypt.genSalt(10);
      biz.password = await bcrypt.hash(password, salt);
    }
    if (typeof isLoginEnabled === 'boolean') {
      biz.isLoginEnabled = isLoginEnabled;
    }
    await user.save();
    res.json({ message: 'Business credentials updated successfully', business: biz });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/businesses/:userId/:bizId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.businesses.pull({ _id: req.params.bizId });
    await user.save();
    res.json({ message: 'Business deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- EXPENSES CRUD ---
router.put('/expenses/:id', async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Expense not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/expenses/:id', async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- SALES CRUD ---
router.put('/sales/:id', async (req, res) => {
  try {
    const updated = await Sale.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Sale not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/sales/:id', async (req, res) => {
  try {
    const deleted = await Sale.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Sale not found' });
    res.json({ message: 'Sale deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- INVENTORY CRUD ---
router.put('/inventory/:id', async (req, res) => {
  try {
    const updated = await Inventory.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Inventory item not found' });
    if (updated.productId && req.body.quantity !== undefined) {
      await Product.findByIdAndUpdate(updated.productId, { stock: Number(req.body.quantity) || 0 });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/inventory/:id', async (req, res) => {
  try {
    const deleted = await Inventory.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Inventory item not found' });
    if (deleted.productId) {
      await Product.findByIdAndUpdate(deleted.productId, { stock: 0 });
    }
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- CLIENT CUSTOMERS CRUD ---
router.put('/customers/:id', async (req, res) => {
  try {
    const updated = await Customer.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Customer not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/customers/:id', async (req, res) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- ATTENDANCE CRUD ---
router.put('/attendance/:id', async (req, res) => {
  try {
    const updated = await Attendance.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Attendance record not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/attendance/:id', async (req, res) => {
  try {
    const deleted = await Attendance.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Attendance record not found' });
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- LEAVES CRUD ---
router.put('/leaves/:id', async (req, res) => {
  try {
    const updated = await Leave.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Leave record not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/leaves/:id', async (req, res) => {
  try {
    const deleted = await Leave.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Leave record not found' });
    res.json({ message: 'Leave record deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- REMINDERS CRUD ---
router.put('/reminders/:id', async (req, res) => {
  try {
    const updated = await Reminder.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Reminder not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/reminders/:id', async (req, res) => {
  try {
    const deleted = await Reminder.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Reminder not found' });
    res.json({ message: 'Reminder deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- DOCUMENTS CRUD ---
router.put('/documents/:id', async (req, res) => {
  try {
    const updated = await Document.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Document not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/documents/:id', async (req, res) => {
  try {
    const deleted = await Document.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Document not found' });
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- PURCHASES CRUD ---
router.put('/purchases/:id', async (req, res) => {
  try {
    const updated = await Purchase.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Purchase not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/purchases/:id', async (req, res) => {
  try {
    const deleted = await Purchase.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Purchase not found' });
    res.json({ message: 'Purchase deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- PRODUCTS CRUD ---
router.put('/products/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    if (updated.itemType === 'Service') {
      await Inventory.deleteMany({ productId: updated._id });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    await Inventory.deleteMany({ productId: deleted._id });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================
// ADMIN CREATE / POST ENDPOINTS (CREATE ON BEHALF OF CUSTOMER)
// ============================================================
router.post('/branches', async (req, res) => {
  try {
    const data = { ...req.body };
    let cleanBranchId = (data.branchId || data.branchCode || '').trim();
    if (!cleanBranchId) {
      cleanBranchId = await generateNextBranchId(data.tenantId);
    } else {
      const duplicateBranch = await Branch.findOne({
        tenantId: data.tenantId,
        $or: [
          { branchId: { $regex: new RegExp(`^${escapeRegex(cleanBranchId)}$`, 'i') } },
          { branchCode: { $regex: new RegExp(`^${escapeRegex(cleanBranchId)}$`, 'i') } }
        ]
      });
      if (duplicateBranch) {
        return res.status(400).json({
          message: `Branch ID "${cleanBranchId}" is already assigned to branch "${duplicateBranch.name}". Please use a unique Branch ID.`
        });
      }
    }
    data.branchId = cleanBranchId;
    data.branchCode = cleanBranchId;

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const branch = new Branch(data);
    const saved = await branch.save();
    const result = saved.toObject();
    delete result.password;
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/employees', async (req, res) => {
  try {
    const data = { ...req.body };
    let cleanEmployeeId = (data.employeeId || '').trim();
    if (!cleanEmployeeId) {
      cleanEmployeeId = await generateNextEmployeeId(data.tenantId);
    } else {
      const duplicateEmp = await Employee.findOne({
        tenantId: data.tenantId,
        employeeId: { $regex: new RegExp(`^${escapeRegex(cleanEmployeeId)}$`, 'i') }
      });
      if (duplicateEmp) {
        return res.status(400).json({
          message: `Employee ID "${cleanEmployeeId}" is already assigned to employee "${duplicateEmp.name}". Please use a unique Employee ID.`
        });
      }
    }
    data.employeeId = cleanEmployeeId;

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const employee = new Employee(data);
    const saved = await employee.save();
    const result = saved.toObject();
    delete result.password;
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/businesses/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const newBiz = { ...req.body };

    let cleanBizId = (newBiz.businessId || newBiz.businessCode || '').trim();
    if (!cleanBizId) {
      cleanBizId = generateNextBusinessId(user.businesses || []);
    } else {
      const duplicateBiz = (user.businesses || []).find(b => {
        const bId = (b.businessId || b.businessCode || '').trim();
        return bId.toLowerCase() === cleanBizId.toLowerCase();
      });
      if (duplicateBiz) {
        return res.status(400).json({
          message: `Business ID "${cleanBizId}" is already assigned to business "${duplicateBiz.name}". Please use a unique Business ID.`
        });
      }
    }
    newBiz.businessId = cleanBizId;
    newBiz.businessCode = cleanBizId;

    if (newBiz.password) {
      newBiz.password = await bcrypt.hash(newBiz.password, 10);
    }
    if (!user.businesses) user.businesses = [];
    user.businesses.push(newBiz);
    await user.save();
    res.status(201).json(user.businesses[user.businesses.length - 1]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/expenses', async (req, res) => {
  try {
    const expense = new Expense(req.body);
    const saved = await expense.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/sales', async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.invoiceNo) {
      data.invoiceNo = `INV-${Date.now().toString().slice(-6)}`;
    }
    if (data.totalAmount && !data.amount) data.amount = data.totalAmount;
    if (data.amount && !data.totalAmount) data.totalAmount = data.amount;
    const sale = new Sale(data);
    const saved = await sale.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/inventory', async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.itemName && data.name) data.itemName = data.name;

    const { tenantId, productId, itemName, sku, category, quantity, price, mode, quantityToAdd, supplier, costPrice, notes, unit, measurementType, secondaryUnit, conversionFactor } = data;

    let targetProduct = null;
    if (productId) {
      targetProduct = await Product.findOne({ _id: productId, tenantId });
    }

    let existingInv = null;
    if (productId) {
      existingInv = await Inventory.findOne({ productId, tenantId });
    } else if (itemName) {
      existingInv = await Inventory.findOne({
        tenantId,
        itemName: { $regex: new RegExp(`^${itemName.trim()}$`, 'i') }
      });
    }

    let finalQty = Number(quantity) || 0;
    if (mode === 'add' && quantityToAdd !== undefined) {
      const baseQty = existingInv ? (Number(existingInv.quantity) || 0) : (targetProduct ? (Number(targetProduct.stock) || 0) : 0);
      finalQty = baseQty + (Number(quantityToAdd) || 0);
    }

    if (existingInv) {
      existingInv.quantity = finalQty;
      if (price !== undefined && price !== '') existingInv.price = Number(price);
      if (costPrice !== undefined && costPrice !== '') existingInv.costPrice = Number(costPrice);
      if (supplier !== undefined) existingInv.supplier = supplier;
      if (notes !== undefined) existingInv.notes = notes;
      if (sku) existingInv.sku = sku;
      if (category) existingInv.category = category;
      if (itemName) existingInv.itemName = itemName;
      if (productId) existingInv.productId = productId;
      if (unit !== undefined) existingInv.unit = unit;
      if (measurementType !== undefined) existingInv.measurementType = measurementType;
      if (secondaryUnit !== undefined) existingInv.secondaryUnit = secondaryUnit;
      if (conversionFactor !== undefined && conversionFactor !== '') existingInv.conversionFactor = Number(conversionFactor);
      await existingInv.save();

      const prodId = productId || existingInv.productId;
      if (prodId) {
        await Product.findOneAndUpdate(
          { _id: prodId, tenantId },
          {
            $set: {
              stock: finalQty,
              ...(price !== undefined && price !== '' ? { price: Number(price) } : {}),
              ...(costPrice !== undefined && costPrice !== '' ? { costPrice: Number(costPrice) } : {}),
              ...(unit !== undefined ? { unit } : {}),
              ...(measurementType !== undefined ? { measurementType } : {}),
              ...(secondaryUnit !== undefined ? { secondaryUnit } : {}),
              ...(conversionFactor !== undefined && conversionFactor !== '' ? { conversionFactor: Number(conversionFactor) } : {})
            }
          }
        );
      }

      return res.json(existingInv);
    }

    const finalItemName = itemName || targetProduct?.name || data.name || 'Item';
    const finalSku = sku || targetProduct?.sku || '';
    const finalPrice = price !== undefined && price !== '' ? Number(price) : (targetProduct?.price || 0);

    const inv = new Inventory({
      tenantId,
      productId: productId || undefined,
      itemName: finalItemName,
      sku: finalSku,
      category: category || targetProduct?.category || 'General',
      quantity: finalQty,
      price: finalPrice,
      costPrice: costPrice !== undefined && costPrice !== '' ? Number(costPrice) : 0,
      unit: unit || targetProduct?.unit || 'pcs',
      measurementType: measurementType || targetProduct?.measurementType || 'Piece',
      secondaryUnit: secondaryUnit || targetProduct?.secondaryUnit || '',
      conversionFactor: conversionFactor !== undefined && conversionFactor !== '' ? Number(conversionFactor) : (targetProduct?.conversionFactor || 1),
      supplier: supplier || '',
      notes: notes || ''
    });

    const saved = await inv.save();

    if (productId) {
      await Product.findOneAndUpdate(
        { _id: productId, tenantId },
        {
          $set: {
            stock: finalQty,
            ...(price !== undefined && price !== '' ? { price: Number(price) } : {}),
            ...(costPrice !== undefined && costPrice !== '' ? { costPrice: Number(costPrice) } : {}),
            ...(unit !== undefined ? { unit } : {}),
            ...(measurementType !== undefined ? { measurementType } : {}),
            ...(secondaryUnit !== undefined ? { secondaryUnit } : {}),
            ...(conversionFactor !== undefined && conversionFactor !== '' ? { conversionFactor: Number(conversionFactor) } : {})
          }
        }
      );
    }

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/products', async (req, res) => {
  try {
    const prod = new Product(req.body);
    const saved = await prod.save();
    // Only auto-create inventory entry if it's a product (not service)
    if (saved.itemType === 'Product' || (!saved.itemType && saved.itemType !== 'Service')) {
      let categoryName = '';
      if (saved.categoryId) {
        const cat = await Category.findById(saved.categoryId);
        if (cat) categoryName = cat.name;
      }
      await Inventory.create({
        tenantId: saved.tenantId,
        itemName: saved.name,
        sku: saved.sku || '',
        category: categoryName,
        quantity: Number(saved.stock) || 0,
        price: Number(saved.price) || 0,
        productId: saved._id
      });
    }
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/customers', async (req, res) => {
  try {
    const cust = new Customer(req.body);
    const saved = await cust.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/attendance', async (req, res) => {
  try {
    const att = new Attendance(req.body);
    const saved = await att.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/leaves', async (req, res) => {
  try {
    const leave = new Leave(req.body);
    const saved = await leave.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/reminders', async (req, res) => {
  try {
    const reminder = new Reminder(req.body);
    const saved = await reminder.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/documents', async (req, res) => {
  try {
    const doc = new Document(req.body);
    const saved = await doc.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/purchases', async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.poNumber) {
      data.poNumber = `PO-${Date.now().toString().slice(-6)}`;
    }
    const purchase = new Purchase(data);
    const saved = await purchase.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- CATEGORIES CRUD ---
router.post('/categories', async (req, res) => {
  try {
    const cat = new Category(req.body);
    const saved = await cat.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Category not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- SUBCATEGORIES CRUD ---
router.post('/subcategories', async (req, res) => {
  try {
    const sub = new SubCategory(req.body);
    const saved = await sub.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/subcategories/:id', async (req, res) => {
  try {
    const updated = await SubCategory.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'SubCategory not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/subcategories/:id', async (req, res) => {
  try {
    const deleted = await SubCategory.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'SubCategory not found' });
    res.json({ message: 'SubCategory deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- INVESTORS CRUD (ADMIN ON BEHALF OF CUSTOMER) ---
router.post('/investors', async (req, res) => {
  try {
    const { 
      tenantId, name, email, password, phone, investmentAmount, 
      investmentDate, ownershipPercentage, associatedBusiness, 
      associatedBranch, status, isLoginEnabled, notes 
    } = req.body;

    if (!tenantId || !name || !email) {
      return res.status(400).json({ message: 'Tenant ID, name, and email are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await Investor.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ message: 'Email is already registered for another investor' });
    }

    const initialPassword = password || Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(initialPassword, salt);

    const count = await Investor.countDocuments({ tenantId });
    const investorId = `INV-${String(count + 1).padStart(3, '0')}`;

    const investor = new Investor({
      investorId,
      name,
      email: cleanEmail,
      password: hashedPassword,
      phone: phone || '',
      investmentAmount: Number(investmentAmount) || 0,
      investmentDate: investmentDate || Date.now(),
      ownershipPercentage: Number(ownershipPercentage) || 0,
      associatedBusiness: associatedBusiness || 'All Businesses',
      associatedBranch: associatedBranch || 'All Branches',
      status: status || 'Active',
      isLoginEnabled: isLoginEnabled !== false,
      notes: notes || '',
      tenantId,
      role: 'investor'
    });

    await investor.save();
    const saved = investor.toObject();
    delete saved.password;
    res.status(201).json({ message: 'Investor registered successfully', investor: saved });
  } catch (err) {
    console.error('Error creating investor via admin:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

router.put('/investors/:id', async (req, res) => {
  try {
    const {
      name, email, phone, investmentAmount, investmentDate,
      ownershipPercentage, associatedBusiness, associatedBranch,
      status, isLoginEnabled, notes
    } = req.body;

    const investor = await Investor.findById(req.params.id);
    if (!investor) return res.status(404).json({ message: 'Investor not found' });

    if (name !== undefined) investor.name = name;
    if (email !== undefined) investor.email = email.trim().toLowerCase();
    if (phone !== undefined) investor.phone = phone;
    if (investmentAmount !== undefined) investor.investmentAmount = Number(investmentAmount);
    if (investmentDate !== undefined) investor.investmentDate = investmentDate;
    if (ownershipPercentage !== undefined) investor.ownershipPercentage = Number(ownershipPercentage);
    if (associatedBusiness !== undefined) investor.associatedBusiness = associatedBusiness;
    if (associatedBranch !== undefined) investor.associatedBranch = associatedBranch;
    if (status !== undefined) investor.status = status;
    if (isLoginEnabled !== undefined) investor.isLoginEnabled = Boolean(isLoginEnabled);
    if (notes !== undefined) investor.notes = notes;

    await investor.save();
    const saved = investor.toObject();
    delete saved.password;
    res.json({ message: 'Investor updated successfully', investor: saved });
  } catch (err) {
    console.error('Error updating investor via admin:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

router.put('/investors/:id/credentials', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const investor = await Investor.findById(req.params.id);
    if (!investor) return res.status(404).json({ message: 'Investor not found' });

    const salt = await bcrypt.genSalt(10);
    investor.password = await bcrypt.hash(password, salt);
    await investor.save();
    res.json({ message: 'Investor password updated successfully' });
  } catch (err) {
    console.error('Error updating investor password via admin:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

router.delete('/investors/:id', async (req, res) => {
  try {
    const deleted = await Investor.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Investor not found' });
    res.json({ message: 'Investor removed successfully' });
  } catch (err) {
    console.error('Error deleting investor via admin:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

module.exports = router;