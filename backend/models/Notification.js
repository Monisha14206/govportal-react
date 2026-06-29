const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  channel: { type: String, required: true }, // 'email' or 'sms'
  recipient: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: 'sent' }, // sent, failed, simulated
  read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
}, schemaOptions);

module.exports = mongoose.model('Notification', notificationSchema);
