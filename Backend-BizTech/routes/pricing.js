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
    res.status(500).send('Server error');
  }
});

// @route   POST /api/pricing
// @desc    Create a new pricing plan
// @access  Admin
router.post('/', async (req, res) => {
  try {
    const { customerType, amount, description } = req.body;
    let plan = await Pricing.findOne({ customerType });
    if (plan) {
      return res.status(400).json({ message: 'Pricing for this customer type already exists' });
    }
    plan = new Pricing({ customerType, amount, description });
    await plan.save();
    res.json(plan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/pricing/:id
// @desc    Update a pricing plan
// @access  Admin
router.put('/:id', async (req, res) => {
  try {
    const { customerType, amount, description } = req.body;
    let plan = await Pricing.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Pricing plan not found' });
    }
    
    plan.customerType = customerType || plan.customerType;
    plan.amount = amount !== undefined ? amount : plan.amount;
    plan.description = description !== undefined ? description : plan.description;
    
    await plan.save();
    res.json(plan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
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
    res.status(500).send('Server error');
  }
});

module.exports = router;
