const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const User = require('../models/User');

// Multer Storage for PAN Verification Proofs
const panProofDir = path.join(__dirname, '../uploads/pan-proofs');
if (!fs.existsSync(panProofDir)) {
  fs.mkdirSync(panProofDir, { recursive: true });
}

const panProofStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, panProofDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `pan_${cleanBase}_${uniqueSuffix}${ext}`);
  }
});

const uploadPanProof = multer({
  storage: panProofStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    if (allowed.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WEBP images and PDF documents are allowed as PAN proof.'));
    }
  }
});

// Auth middleware (optional or strict)
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded.user || decoded.admin || decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// @route   GET /api/directory/businesses
// @desc    List registered free businesses (Google Business Profile style)
// @access  Public / Authenticated
router.get('/businesses', async (req, res) => {
  try {
    const { search, category, city, tag } = req.query;

    const query = {
      accountType: 'free_business'
    };

    if (category && category !== 'All') {
      query['businessProfile.category'] = { $regex: new RegExp(category, 'i') };
    }

    if (city && city !== 'All') {
      query['businessProfile.city'] = { $regex: new RegExp(city, 'i') };
    }

    if (tag && tag !== 'All') {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { tags: { $in: [new RegExp(tag, 'i')] } },
          { 'businessProfile.tags': { $in: [new RegExp(tag, 'i')] } }
        ]
      });
    }

    if (search && search.trim()) {
      const term = search.trim();
      const regex = new RegExp(term, 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { 'businessProfile.businessName': regex },
          { 'businessProfile.ownerName': regex },
          { 'businessProfile.category': regex },
          { 'businessProfile.city': regex },
          { 'businessProfile.address': regex },
          { 'businessProfile.panNumber': regex },
          { tags: { $in: [regex] } },
          { 'businessProfile.tags': { $in: [regex] } }
        ]
      });
    }

    const businesses = await User.find(query)
      .select('userId fullName email phone tags businessProfile createdAt')
      .sort({ createdAt: -1 })
      .limit(100);

    // Format output
    const formatted = businesses.map(b => ({
      _id: b._id,
      userId: b.userId,
      businessName: b.businessProfile?.businessName || b.fullName,
      category: b.businessProfile?.category || 'Retail',
      tags: b.businessProfile?.tags?.length ? b.businessProfile.tags : b.tags,
      ownerName: b.businessProfile?.ownerName || b.fullName,
      phone: b.businessProfile?.contactPhone || b.phone,
      whatsappNumber: b.businessProfile?.whatsappNumber || b.businessProfile?.contactPhone || b.phone,
      email: b.businessProfile?.email || b.email,
      address: b.businessProfile?.address || '',
      city: b.businessProfile?.city || '',
      state: b.businessProfile?.state || '',
      pincode: b.businessProfile?.pincode || '',
      operatingHours: b.businessProfile?.operatingHours || '9:00 AM - 9:00 PM',
      websiteOrSocial: b.businessProfile?.websiteOrSocial || '',
      description: b.businessProfile?.description || '',
      panNumber: b.businessProfile?.panNumber || '',
      panProofUrl: b.businessProfile?.panProofUrl || '',
      panProofName: b.businessProfile?.panProofName || '',
      isVerified: Boolean(b.businessProfile?.isVerified),
      registeredAt: b.createdAt
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Directory businesses fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch business directory' });
  }
});

// @route   GET /api/directory/careers
// @desc    List registered job seekers / workers (LinkedIn style)
// @access  Public / Authenticated
router.get('/careers', async (req, res) => {
  try {
    const { search, jobCategory, city, skill, availability, drivingLicense } = req.query;

    const query = {
      accountType: 'free_career'
    };

    if (jobCategory && jobCategory !== 'All') {
      query['careerProfile.jobCategory'] = { $regex: new RegExp(jobCategory, 'i') };
    }

    if (city && city !== 'All') {
      query['careerProfile.city'] = { $regex: new RegExp(city, 'i') };
    }

    if (availability && availability !== 'All') {
      query['careerProfile.availability'] = availability;
    }

    if (drivingLicense && drivingLicense !== 'All') {
      query['careerProfile.drivingLicense'] = { $regex: new RegExp(drivingLicense, 'i') };
    }

    if (skill && skill !== 'All') {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { tags: { $in: [new RegExp(skill, 'i')] } },
          { 'careerProfile.skills': { $in: [new RegExp(skill, 'i')] } }
        ]
      });
    }

    if (search && search.trim()) {
      const term = search.trim();
      const regex = new RegExp(term, 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { 'careerProfile.fullName': regex },
          { 'careerProfile.jobCategory': regex },
          { 'careerProfile.city': regex },
          { 'careerProfile.currentArea': regex },
          { 'careerProfile.qualification': regex },
          { 'careerProfile.bio': regex },
          { tags: { $in: [regex] } },
          { 'careerProfile.skills': { $in: [regex] } }
        ]
      });
    }

    const candidates = await User.find(query)
      .select('userId fullName email phone tags careerProfile createdAt')
      .sort({ createdAt: -1 })
      .limit(100);

    const formatted = candidates.map(c => ({
      _id: c._id,
      userId: c.userId,
      fullName: c.careerProfile?.fullName || c.fullName,
      jobCategory: c.careerProfile?.jobCategory || 'General Staff',
      skills: c.careerProfile?.skills?.length ? c.careerProfile.skills : c.tags,
      experience: c.careerProfile?.experience || 'Fresher',
      expectedSalary: c.careerProfile?.expectedSalary || '',
      city: c.careerProfile?.city || '',
      currentArea: c.careerProfile?.currentArea || '',
      pincode: c.careerProfile?.pincode || '',
      phone: c.careerProfile?.contactPhone || c.phone,
      whatsappNumber: c.careerProfile?.whatsappNumber || c.careerProfile?.contactPhone || c.phone,
      email: c.careerProfile?.email || c.email,
      availability: c.careerProfile?.availability || 'Immediate',
      employmentType: c.careerProfile?.employmentType || 'Full-time',
      drivingLicense: c.careerProfile?.drivingLicense || 'None',
      qualification: c.careerProfile?.qualification || '',
      bio: c.careerProfile?.bio || '',
      isAvailableForHire: c.careerProfile?.isAvailableForHire !== false,
      registeredAt: c.createdAt
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Directory careers fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch talent directory' });
  }
});

// @route   GET /api/directory/my-profile
// @desc    Get current user profile (for business/profile or career/profile views)
// @access  Authenticated
router.get('/my-profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/directory/upload-pan-proof
// @desc    Upload PAN card image or PDF proof
// @access  Authenticated
router.post('/upload-pan-proof', auth, (req, res) => {
  uploadPanProof.single('proof')(req, res, (err) => {
    if (err) {
      console.error('PAN proof upload error:', err);
      return res.status(400).json({ success: false, message: err.message || 'Failed to upload PAN proof' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No proof file uploaded. Please select an image or PDF.' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/pan-proofs/${req.file.filename}`;

    res.json({
      success: true,
      fileUrl,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      message: 'PAN card proof uploaded successfully'
    });
  });
});

// @route   PUT /api/directory/my-business-profile
// @desc    Update current free business profile
// @access  Authenticated
router.put('/my-business-profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const {
      businessName, category, tags, ownerName, contactPhone, whatsappNumber,
      email, address, city, state, pincode, operatingHours, websiteOrSocial, description,
      panNumber, panProofUrl, panProofName
    } = req.body;

    // Validate PAN Number if provided
    let cleanPan = '';
    if (panNumber && typeof panNumber === 'string' && panNumber.trim()) {
      cleanPan = panNumber.trim().toUpperCase();
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(cleanPan)) {
        return res.status(400).json({
          message: 'Invalid PAN Card Number format. Must be 10 alphanumeric characters (e.g. ABCDE1234F).'
        });
      }

      // Check unique PAN across other businesses
      const existingPan = await User.findOne({
        _id: { $ne: user._id },
        accountType: 'free_business',
        'businessProfile.panNumber': cleanPan
      });

      if (existingPan) {
        return res.status(400).json({
          message: `PAN Card Number "${cleanPan}" is already registered by another business. Each business must have a unique PAN.`
        });
      }
    }

    user.businessProfile = {
      ...(user.businessProfile?.toObject ? user.businessProfile.toObject() : (user.businessProfile || {})),
      ...(businessName ? { businessName } : {}),
      ...(category ? { category } : {}),
      ...(tags ? { tags } : {}),
      ...(ownerName ? { ownerName } : {}),
      ...(contactPhone ? { contactPhone } : {}),
      ...(whatsappNumber ? { whatsappNumber } : {}),
      ...(email ? { email } : {}),
      ...(address ? { address } : {}),
      ...(city ? { city } : {}),
      ...(state ? { state } : {}),
      ...(pincode ? { pincode } : {}),
      ...(operatingHours ? { operatingHours } : {}),
      ...(websiteOrSocial ? { websiteOrSocial } : {}),
      ...(description ? { description } : {}),
      ...(cleanPan ? { panNumber: cleanPan } : {}),
      ...(panProofUrl ? { panProofUrl } : {}),
      ...(panProofName ? { panProofName } : {})
    };

    if (tags && Array.isArray(tags)) {
      user.tags = tags;
    }
    if (businessName) {
      user.businessName = businessName;
    }

    user.accountType = 'free_business';
    user.isOnboardingCompleted = true;

    await user.save();
    res.json({ message: 'Business profile updated successfully', user });
  } catch (err) {
    console.error('Error updating business profile:', err);
    res.status(500).json({ message: 'Failed to update business profile' });
  }
});

// @route   PUT /api/directory/my-career-profile
// @desc    Update current free career profile
// @access  Authenticated
router.put('/my-career-profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const {
      fullName, jobCategory, skills, experience, expectedSalary, city, currentArea,
      pincode, contactPhone, whatsappNumber, email, availability, employmentType,
      drivingLicense, qualification, bio, isAvailableForHire
    } = req.body;

    user.careerProfile = {
      ...(user.careerProfile?.toObject ? user.careerProfile.toObject() : (user.careerProfile || {})),
      ...(fullName ? { fullName } : {}),
      ...(jobCategory ? { jobCategory } : {}),
      ...(skills ? { skills } : {}),
      ...(experience ? { experience } : {}),
      ...(expectedSalary ? { expectedSalary } : {}),
      ...(city ? { city } : {}),
      ...(currentArea ? { currentArea } : {}),
      ...(pincode ? { pincode } : {}),
      ...(contactPhone ? { contactPhone } : {}),
      ...(whatsappNumber ? { whatsappNumber } : {}),
      ...(email ? { email } : {}),
      ...(availability ? { availability } : {}),
      ...(employmentType ? { employmentType } : {}),
      ...(drivingLicense ? { drivingLicense } : {}),
      ...(qualification ? { qualification } : {}),
      ...(bio !== undefined ? { bio } : {}),
      ...(isAvailableForHire !== undefined ? { isAvailableForHire } : {})
    };

    if (skills && Array.isArray(skills)) {
      user.tags = skills;
    }
    if (fullName) {
      user.fullName = fullName;
    }

    user.accountType = 'free_career';
    user.isOnboardingCompleted = true;

    await user.save();
    res.json({ message: 'Career profile updated successfully', user });
  } catch (err) {
    console.error('Error updating career profile:', err);
    res.status(500).json({ message: 'Failed to update career profile' });
  }
});

// @route   PUT /api/directory/select-pro
// @desc    Set account to pro_business to proceed to full onboarding
// @access  Authenticated
router.put('/select-pro', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.accountType = 'pro_business';
    user.isOnboardingCompleted = false;
    await user.save();

    res.json({ message: 'Proceed to onboarding', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to set pro business' });
  }
});

// @route   PUT /api/directory/toggle-hire-status
// @desc    Quick toggle for candidate availability
// @access  Authenticated
router.put('/toggle-hire-status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const currentStatus = user.careerProfile?.isAvailableForHire !== false;
    if (!user.careerProfile) user.careerProfile = {};
    user.careerProfile.isAvailableForHire = !currentStatus;

    await user.save();
    res.json({
      message: `Status updated to ${user.careerProfile.isAvailableForHire ? 'Available for Hire' : 'Not Looking'}`,
      isAvailableForHire: user.careerProfile.isAvailableForHire
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle status' });
  }
});

module.exports = router;
