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
    const { name, phone, email, designation, department, avatar } = req.body;

    if (name) admin.name = name;
    if (phone) admin.phone = phone;
    if (email) admin.email = email;
    if (designation) admin.designation = designation;
    if (department) admin.department = department;
    if (avatar !== undefined) admin.avatar = avatar;

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
// @desc    Get all users (customers)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
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

// @route   GET /api/admin/users/:id/details
// @desc    Get complete customer data (profile, branches, staff, businesses, metrics, session)
router.get('/users/:id/details', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const tenantIdStr = user._id.toString();
    const tenantIdObj = user._id;
    const matchTenant = { $in: [tenantIdStr, tenantIdObj] };

    const [branches, employees, customersCount, inventoryCount, salesCount] = await Promise.all([
      Branch.find({ tenantId: matchTenant }).select('-password').sort({ createdAt: -1 }),
      Employee.find({ tenantId: matchTenant }).sort({ createdAt: -1 }),
      Customer.countDocuments({ tenantId: matchTenant }).catch(() => 0),
      Inventory.countDocuments({ tenantId: matchTenant }).catch(() => 0),
      Sale.countDocuments({ tenantId: matchTenant }).catch(() => 0)
    ]);

    // Generate user impersonation token for the embedded workspace viewer
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
        businessType: user.businessType || 1,
        industry: user.industry || 'Not specified',
        address: user.address || 'Not specified',
        regNo: user.regNo || 'N/A',
        businessPhone: user.businessPhone || user.phone || 'N/A',
        createdAt: user.createdAt,
        modules: user.modules || [],
        businesses: user.businesses || [],
        subscriptionStatus: user.subscriptionStatus || 'Active',
        subscriptionBillingCycle: user.subscriptionBillingCycle || 'Monthly',
        subscriptionRenewalDate: user.subscriptionRenewalDate,
        subscriptionCustomAmount: user.subscriptionCustomAmount
      },
      branches: branches || [],
      employees: employees || [],
      businesses: user.businesses || [],
      counts: {
        branches: branches ? branches.length : 0,
        employees: employees ? employees.length : 0,
        businesses: (user.businesses && user.businesses.length > 0) ? user.businesses.length : 1,
        customers: customersCount || 0,
        inventory: inventoryCount || 0,
        sales: salesCount || 0
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

      // Renewal date: if not set, set to 30 days after creation, recurring
      let renewalDate = user.subscriptionRenewalDate;
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
        modules: user.modules || []
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

// @route   PUT /api/admin/subscriptions/:id
// @desc    Update a tenant subscription
router.put('/subscriptions/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { status, businessType, billingCycle, customAmount, renewalDate } = req.body;

    if (status) user.subscriptionStatus = status;
    if (businessType !== undefined) user.businessType = Number(businessType);
    if (billingCycle) user.subscriptionBillingCycle = billingCycle;
    if (customAmount !== undefined) user.subscriptionCustomAmount = Number(customAmount);
    if (renewalDate) user.subscriptionRenewalDate = new Date(renewalDate);

    await user.save();

    res.json({
      message: 'Subscription updated successfully',
      user: {
        _id: user._id,
        subscriptionStatus: user.subscriptionStatus,
        businessType: user.businessType,
        subscriptionBillingCycle: user.subscriptionBillingCycle,
        subscriptionCustomAmount: user.subscriptionCustomAmount,
        subscriptionRenewalDate: user.subscriptionRenewalDate
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;