const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Branch = require('../models/Branch');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Authentication middleware for strict tenant isolation
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No authorization token, access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

// Helper to sanitize employee object before returning to client
const sanitizeEmployee = (emp) => {
  const obj = emp.toObject ? emp.toObject() : { ...emp };
  obj.hasPassword = Boolean(obj.password);
  delete obj.password;
  if (obj.isLoginEnabled === undefined) {
    obj.isLoginEnabled = true;
  }
  return obj;
};

// @route   GET /api/employees
// @desc    Get all employees for the authenticated tenant only
router.get('/', auth, async (req, res) => {
  try {
    let query = { tenantId: req.user.id };

    // 1. If logged in as branch, strictly scope to employees of this branch
    if (req.user.role === 'branch' && req.user.branchId) {
      query.$or = [
        { branchId: req.user.branchId },
        { branchName: req.user.branchName }
      ];
    }

    // 2. If logged in as business, strictly scope to employees of this business
    if (req.user.role === 'business' && req.user.businessName) {
      const cleanBizName = req.user.businessName.trim();
      const bizBranches = await Branch.find({
        tenantId: req.user.id,
        businessName: { $regex: new RegExp(`^${cleanBizName}$`, 'i') }
      }).select('_id name');

      const branchIds = bizBranches.map(b => b._id);
      const branchNames = bizBranches.map(b => b.name);

      query.$or = [
        { businessName: { $regex: new RegExp(`^${cleanBizName}$`, 'i') } },
        { branchId: { $in: branchIds } },
        { branchName: { $in: branchNames } }
      ];
    }

    // 3. Owner (Type 4 or Type 1-3) sees all employees under their tenantId
    const employees = await Employee.find(query).populate('branchId').sort({ createdAt: -1 });
    res.json(employees.map(sanitizeEmployee));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/employees
// @desc    Add a new employee for the authenticated tenant
router.post('/', auth, async (req, res) => {
  try {
    let branchId = req.body.branchId;
    let branchName = req.body.branchName;
    if (req.user.role === 'branch' && req.user.branchId) {
      branchId = req.user.branchId;
      branchName = req.user.branchName;
    }

    let businessName = req.body.businessName || '';
    if (req.user.role === 'business' && req.user.businessName) {
      businessName = req.user.businessName;
    }

    if (!branchId) {
      const singleBranch = await Branch.findOne({ tenantId: req.user.id });
      if (singleBranch) {
        branchId = singleBranch._id;
        branchName = singleBranch.name;
        if (!businessName && singleBranch.businessName) {
          businessName = singleBranch.businessName;
        }
      }
    } else if (!branchName) {
      const branchObj = await Branch.findById(branchId);
      if (branchObj) {
        branchName = branchObj.name;
        if (!businessName && branchObj.businessName) {
          businessName = branchObj.businessName;
        }
      }
    }

    const employeeData = {
      ...req.body,
      tenantId: req.user.id,
      branchId,
      branchName: branchName || req.body.branchName || '',
      businessName
    };

    if (employeeData.password) {
      if (employeeData.password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      const salt = await bcrypt.genSalt(10);
      employeeData.password = await bcrypt.hash(employeeData.password, salt);
    }

    const newEmployee = new Employee(employeeData);
    const savedEmployee = await newEmployee.save();
    
    if (savedEmployee.branchId) {
      await savedEmployee.populate('branchId');
    }
    
    res.status(201).json(sanitizeEmployee(savedEmployee));
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ error: 'An employee with this email address already exists.' });
    }
    res.status(400).json({ error: err.message });
  }
});

// @route   PUT /api/employees/:id/credentials
// @desc    Set or update employee login credentials (Owner, Business, or Branch)
router.put('/:id/credentials', auth, async (req, res) => {
  try {
    const { password, isLoginEnabled } = req.body;
    const filter = { _id: req.params.id, tenantId: req.user.id };

    if (req.user.role === 'branch' && req.user.branchId) {
      filter.$or = [
        { branchId: req.user.branchId },
        { branchName: req.user.branchName }
      ];
    } else if (req.user.role === 'business' && req.user.businessName) {
      const cleanBizName = req.user.businessName.trim();
      const bizBranches = await Branch.find({
        tenantId: req.user.id,
        businessName: { $regex: new RegExp(`^${cleanBizName}$`, 'i') }
      }).select('_id name');
      const branchIds = bizBranches.map(b => b._id);
      const branchNames = bizBranches.map(b => b.name);

      filter.$or = [
        { businessName: { $regex: new RegExp(`^${cleanBizName}$`, 'i') } },
        { branchId: { $in: branchIds } },
        { branchName: { $in: branchNames } }
      ];
    }

    const employee = await Employee.findOne(filter);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found or unauthorized' });
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }
      const salt = await bcrypt.genSalt(10);
      employee.password = await bcrypt.hash(password, salt);
    }

    if (typeof isLoginEnabled === 'boolean') {
      employee.isLoginEnabled = isLoginEnabled;
    }

    await employee.save();
    res.json(sanitizeEmployee(employee));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/employees/:id
// @desc    Update employee (Owner, branch or business only for their own employee)
router.put('/:id', auth, async (req, res) => {
  try {
    const filter = { _id: req.params.id, tenantId: req.user.id };
    if (req.user.role === 'branch' && req.user.branchId) {
      filter.$or = [
        { branchId: req.user.branchId },
        { branchName: req.user.branchName }
      ];
    }
    if (req.user.role === 'business' && req.user.businessName) {
      const cleanBizName = req.user.businessName.trim();
      const bizBranches = await Branch.find({
        tenantId: req.user.id,
        businessName: { $regex: new RegExp(`^${cleanBizName}$`, 'i') }
      }).select('_id name');
      const branchIds = bizBranches.map(b => b._id);
      const branchNames = bizBranches.map(b => b.name);

      filter.$or = [
        { businessName: { $regex: new RegExp(`^${cleanBizName}$`, 'i') } },
        { branchId: { $in: branchIds } },
        { branchName: { $in: branchNames } }
      ];
    }

    const updateData = { ...req.body };
    delete updateData.tenantId; // Never reassign tenantId

    if (updateData.password) {
      if (updateData.password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    } else {
      delete updateData.password;
    }

    if (updateData.branchId && !updateData.branchName) {
      const branchObj = await Branch.findById(updateData.branchId);
      if (branchObj) {
        updateData.branchName = branchObj.name;
      }
    }

    const updated = await Employee.findOneAndUpdate(
      filter,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Employee not found or unauthorized' });
    }
    if (updated.branchId) {
      await updated.populate('branchId');
    }
    res.json(sanitizeEmployee(updated));
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ error: 'An employee with this email address already exists.' });
    }
    res.status(400).json({ error: err.message });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete employee (Owner, branch or business only for their own employee)
router.delete('/:id', auth, async (req, res) => {
  try {
    const filter = { _id: req.params.id, tenantId: req.user.id };
    if (req.user.role === 'branch' && req.user.branchId) {
      filter.$or = [
        { branchId: req.user.branchId },
        { branchName: req.user.branchName }
      ];
    }
    if (req.user.role === 'business' && req.user.businessName) {
      const cleanBizName = req.user.businessName.trim();
      const bizBranches = await Branch.find({
        tenantId: req.user.id,
        businessName: { $regex: new RegExp(`^${cleanBizName}$`, 'i') }
      }).select('_id name');
      const branchIds = bizBranches.map(b => b._id);
      const branchNames = bizBranches.map(b => b.name);

      filter.$or = [
        { businessName: { $regex: new RegExp(`^${cleanBizName}$`, 'i') } },
        { branchId: { $in: branchIds } },
        { branchName: { $in: branchNames } }
      ];
    }

    const deletedEmployee = await Employee.findOneAndDelete(filter);
    if (!deletedEmployee) {
      return res.status(404).json({ error: 'Employee not found or unauthorized' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;