const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: null },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'admin'], default: 'citizen' },
  is_active: { type: Boolean, default: true },
  reset_token_hash: { type: String, default: null },
  reset_token_expires: { type: Date, default: null },
  created_at: { type: Date, default: Date.now }
}, schemaOptions);

module.exports = mongoose.model('User', userSchema);
