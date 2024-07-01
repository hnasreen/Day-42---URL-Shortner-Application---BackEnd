const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  isActive: { type: Boolean, default: false },
  resetToken: String,
  resetTokenExpiry: Date
});

module.exports = mongoose.model('User', UserSchema);