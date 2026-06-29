const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: null },
  subject: { type: String, default: 'General Enquiry' },
  message: { type: String, required: true },
  is_read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
}, schemaOptions);

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
