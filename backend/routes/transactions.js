const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');

// GET all transactions for logged in user (paginated)
router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find({ user: req.user.id }).sort({ date: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments({ user: req.user.id })
    ]);

    res.json({ transactions, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST create transaction
router.post('/', auth, async (req, res) => {
  const { type, amount, category, description } = req.body;
  if (!type || !amount || !category || !description) return res.status(400).json({ msg: 'All fields are required' });
  if (!['income', 'expense'].includes(type)) return res.status(400).json({ msg: 'Invalid type' });
  if (typeof amount !== 'number' || amount <= 0) return res.status(400).json({ msg: 'Amount must be a positive number' });
  if (req.body.date && new Date(req.body.date) > new Date()) return res.status(400).json({ msg: 'Future dates are not allowed' });
  try {
    const transaction = new Transaction({ ...req.body, user: req.user.id });
    await transaction.save();
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT update transaction
router.put('/:id', auth, async (req, res) => {
  try {
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ msg: 'Not found' });
    if (transaction.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    const { type, amount, category, description, date } = req.body;
    const updates = {};
    if (type !== undefined) updates.type = type;
    if (amount !== undefined) updates.amount = amount;
    if (category !== undefined) updates.category = category;
    if (description !== undefined) updates.description = description;
    if (date !== undefined) updates.date = date;

    transaction = await Transaction.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ msg: 'Not found' });
    if (transaction.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    await transaction.deleteOne();
    res.json({ msg: 'Transaction removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;