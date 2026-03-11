const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  budgets: {
    food: { type: Number, default: 5000 },
    transport: { type: Number, default: 2000 },
    entertainment: { type: Number, default: 1500 },
    shopping: { type: Number, default: 3000 },
    health: { type: Number, default: 2000 },
    other: { type: Number, default: 2000 }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);