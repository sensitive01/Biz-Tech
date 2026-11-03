const express = require('express');
const router = express.Router();
const Pricing = require('../models/Pricing');

// @route   GET /api/pricing
// @desc    Get all pricing plans
// @access  Public
router.get('/', async (req, res) => {
  try {
    const plans = await Pricing.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// @route   POST /api/pricing
// @desc    Create a new pricing plan
// @access  Admin
router.post('/', async (req, res) => {
  try {
    const { customerType, amount, description, employeeLimit, branchLimit, businessLimit } = req.body;
    let plan = await Pricing.findOne({ customerType });
    if (plan) {
      return res.status(400).json({ message: 'Pricing for this customer type already exists' });
    }
    const cleanLimit = (employeeLimit === '' || employeeLimit === null || Number(employeeLimit) === 0) ? null : Number(employeeLimit);
    const cleanBranchLimit = (branchLimit === '' || branchLimit === null || Number(branchLimit) === 0) ? null : Number(branchLimit);
    const cleanBusinessLimit = (businessLimit === '' || businessLimit === null || Number(businessLimit) === 0) ? null : Number(businessLimit);
    plan = new Pricing({ 
      customerType, 
      amount, 
      description, 
      employeeLimit: cleanLimit,
      branchLimit: cleanBranchLimit,
      businessLimit: cleanBusinessLimit
    });
    await plan.save();
    res.json(plan);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// @route   PUT /api/pricing/:id
// @desc    Update a pricing plan
// @access  Admin
router.put('/:id', async (req, res) => {
  try {
    const { customerType, amount, description, employeeLimit, branchLimit, businessLimit } = req.body;
    let plan = await Pricing.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Pricing plan not found' });
    }
    
    plan.customerType = customerType || plan.customerType;
    plan.amount = amount !== undefined ? amount : plan.amount;
    plan.description = description !== undefined ? description : plan.description;
    if (employeeLimit !== undefined) {
      plan.employeeLimit = (employeeLimit === '' || employeeLimit === null || Number(employeeLimit) === 0) ? null : Number(employeeLimit);
    }
    if (branchLimit !== undefined) {
      plan.branchLimit = (branchLimit === '' || branchLimit === null || Number(branchLimit) === 0) ? null : Number(branchLimit);
    }
    if (businessLimit !== undefined) {
      plan.businessLimit = (businessLimit === '' || businessLimit === null || Number(businessLimit) === 0) ? null : Number(businessLimit);
    }
    
    await plan.save();
    res.json(plan);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// @route   DELETE /api/pricing/:id
// @desc    Delete a pricing plan
// @access  Admin
router.delete('/:id', async (req, res) => {
  try {
    const plan = await Pricing.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Pricing plan not found' });
    }
    await plan.deleteOne();
    res.json({ message: 'Pricing plan removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

module.exports = router;
