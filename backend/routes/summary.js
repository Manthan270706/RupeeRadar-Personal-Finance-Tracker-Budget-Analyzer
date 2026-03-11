const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// GET monthly summary + budget alerts
router.get('/monthly', auth, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const transactions = await Transaction.find({
      user: req.user.id,
      date: { $gte: startOfMonth }
    });

    const user = await User.findById(req.user.id);
    const categoryTotals = {};
    let totalIncome = 0, totalExpense = 0;

    transactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      }
    });

    // Generate budget alerts
    const alerts = [];
    for (const [category, spent] of Object.entries(categoryTotals)) {
      const budget = user.budgets[category];
      if (budget && spent > budget) {
        alerts.push({ category, spent, budget, overage: spent - budget });
      } else if (budget && spent >= budget * 0.8) {
        alerts.push({ category, spent, budget, warning: true });
      }
    }

    res.json({ totalIncome, totalExpense, categoryTotals, alerts, balance: totalIncome - totalExpense });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET CSV export of all transactions
router.get('/export', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });

    const escapeCsv = (val) => {
      let str = String(val).replace(/"/g, '""');
      if (/^[=+\-@\t\r]/.test(str)) str = "'" + str;
      return `"${str}"`;
    };

    let csv = 'Date,Type,Category,Description,Amount\n';
    transactions.forEach(t => {
      csv += `${escapeCsv(new Date(t.date).toLocaleDateString())},${escapeCsv(t.type)},${escapeCsv(t.category)},${escapeCsv(t.description)},${escapeCsv(t.amount)}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT update budget limits
router.put('/budgets', auth, async (req, res) => {
  try {
    const allowedCategories = ['food', 'transport', 'entertainment', 'shopping', 'health', 'other'];
    const budgets = {};

    for (const [key, value] of Object.entries(req.body)) {
      if (!allowedCategories.includes(key)) {
        return res.status(400).json({ msg: `Invalid budget category: ${key}` });
      }
      if (typeof value !== 'number' || value < 0) {
        return res.status(400).json({ msg: `Budget for ${key} must be a non-negative number` });
      }
      budgets[key] = value;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { budgets },
      { new: true }
    );
    res.json(user.budgets);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;