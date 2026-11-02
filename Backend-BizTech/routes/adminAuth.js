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
const Document = require('../models/Document');

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
      subcategories
    ] = await Promise.all([
      Branch.find({ tenantId: matchTenant }).select('-password').sort({ createdAt: -1 }),
      Employee.find({ tenantId: matchTenant }).select('-password').sort({ createdAt: -1 }),
      Customer.find({ tenantId: matchTenant }).sort({ createdAt: -1 }),
      Inventory.find({ tenantId: matchTenant }).sort({ createdAt: -1 }),
      Product.find({ tenantId: matchTenant }).populate('categoryId', 'name').populate('subCategoryId', 'name').sort({ createdAt: -1 }),
      Sale.find({ tenantId: matchTenant }).sort({ createdAt: -1 }),
      Expense.find({ tenantId: matchTenant }).sort({ createdAt: -1 }),
      Purchase.find({ tenantId: matchTenant }).sort({ createdAt: -1 }),
      Attendance.find({ tenantId: matchTenant }).populate('employeeId', 'name email position').sort({ date: -1 }),
      Leave.find({ tenantId: matchTenant }).populate('employeeId', 'name email position').sort({ createdAt: -1 }),
      Reminder.find({ tenantId: matchTenant }).sort({ date: -1 }),
      Document.find({ tenantId: matchTenant }).sort({ createdAt: -1 }),
      Category.find({ tenantId: matchTenant }).sort({ createdAt: -1 }),
      SubCategory.find({ tenantId: matchTenant }).populate('categoryId', 'name').sort({ createdAt: -1 })
    ]);

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
      categories: categories || [],
      subcategories: subcategories || [],
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
        products: products ? products.length : 0,
        sales: sales ? sales.length : 0,
        expenses: expenses ? expenses.length : 0,
        purchases: purchases ? purchases.length : 0,
        attendance: attendance ? attendance.length : 0,
        leaves: leaves ? leaves.length : 0,
        reminders: reminders ? reminders.length : 0,
        documents: documents ? documents.length : 0,
        categories: categories ? categories.length : 0,
        subcategories: subcategories ? subcategories.length : 0
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
      password 
    } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (fullName !== undefined) user.fullName = fullName;
    if (businessName !== undefined) user.businessName = businessName;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (industry !== undefined) user.industry = industry;
    if (address !== undefined) user.address = address;
    if (regNo !== undefined) user.regNo = regNo;
    if (businessPhone !== undefined) user.businessPhone = businessPhone;
    if (subscriptionStatus !== undefined) user.subscriptionStatus = subscriptionStatus;
    if (subscriptionBillingCycle !== undefined) user.subscriptionBillingCycle = subscriptionBillingCycle;
    if (subscriptionCustomAmount !== undefined) user.subscriptionCustomAmount = Number(subscriptionCustomAmount);

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
    const updateData = { ...req.body };
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
    if (!updated) return res.status(404).json({ message: 'Branch not found' });
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
    const updateData = { ...req.body };
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
    if (!updated) return res.status(404).json({ message: 'Employee not found' });
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
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/inventory/:id', async (req, res) => {
  try {
    const deleted = await Inventory.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Inventory item not found' });
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
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
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
    const inv = new Inventory(data);
    const saved = await inv.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/products', async (req, res) => {
  try {
    const prod = new Product(req.body);
    const saved = await prod.save();
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

module.exports = router;