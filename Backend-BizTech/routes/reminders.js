const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// @route   GET /api/reminders
// @desc    Get all reminders for tenant
router.get('/', auth, async (req, res) => {
  try {
    const items = await Reminder.find({ tenantId: req.user.id }).sort({ date: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/reminders/active-notifications
// @desc    Get active reminders due today or within advance notification window
router.get('/active-notifications', auth, async (req, res) => {
  try {
    const items = await Reminder.find({ tenantId: req.user.id });
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const active = [];

    items.forEach(item => {
      if (item.status === 'Completed') return;

      const itemDate = new Date(item.date);
      let targetDate;

      if (item.repeatMonthly) {
        const itemYear = itemDate.getFullYear();
        const currentYear = today.getFullYear();

        // Applicable ONLY for the current year
        if (itemYear !== currentYear) {
          targetDate = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
        } else {
          const dayOfMonth = itemDate.getDate();
          const startMonth = itemDate.getMonth();
          const currentMonth = today.getMonth();

          // Only valid starting from the original event month in the current year
          if (currentMonth < startMonth) {
            targetDate = new Date(currentYear, startMonth, dayOfMonth);
          } else {
            const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const adjustedDay = Math.min(dayOfMonth, daysInCurrentMonth);
            targetDate = new Date(currentYear, currentMonth, adjustedDay);

            // If target date in current month has passed, check next month ONLY if next month is still within current year
            if (targetDate < today && currentMonth + 1 < 12) {
              const daysInNextMonth = new Date(currentYear, currentMonth + 2, 0).getDate();
              const nextAdjustedDay = Math.min(dayOfMonth, daysInNextMonth);
              const nextTarget = new Date(currentYear, currentMonth + 1, nextAdjustedDay);
              const diffDays = Math.ceil((nextTarget - today) / (1000 * 60 * 60 * 24));
              if (diffDays <= (item.notifyBeforeDays || 0)) {
                targetDate = nextTarget;
              }
            }
          }
        }
      } else {
        targetDate = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
      }

      const diffMs = targetDate - today;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const notifyWindow = Math.max(0, item.notifyBeforeDays || 0);

      // Active if within [0, notifyWindow] consecutive days before event
      if (diffDays >= 0 && diffDays <= notifyWindow) {
        active.push({
          ...item.toObject(),
          effectiveDate: targetDate,
          daysRemaining: diffDays,
          isDueToday: diffDays === 0,
          notificationMessage: diffDays === 0
            ? `Due today: ${item.title}`
            : diffDays === 1
              ? `Due tomorrow: ${item.title}`
              : `Due in ${diffDays} days: ${item.title}`
        });
      }
    });

    active.sort((a, b) => a.daysRemaining - b.daysRemaining);
    res.json(active);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/reminders
// @desc    Create a new reminder
router.post('/', auth, async (req, res) => {
  try {
    const newItem = new Reminder({ ...req.body, tenantId: req.user.id });
    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/reminders/:id
// @desc    Update a reminder
router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Reminder.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.id },
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Reminder not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/reminders/:id
// @desc    Delete a reminder
router.delete('/:id', auth, async (req, res) => {
  try {
    await Reminder.findOneAndDelete({ _id: req.params.id, tenantId: req.user.id });
    res.json({ msg: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
