const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');
const statusHistorySchema = require('./statusHistorySchema');

const complaintSchema = new mongoose.Schema({
  complaint_number: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, default: null },
  attachment_path: { type: String, default: null },
  status: {
    type: String,
    enum: ['Registered', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Registered'
  },
  remarks: { type: String, default: null },
  statusHistory: { type: [statusHistorySchema], default: [] },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, schemaOptions);

module.exports = mongoose.model('Complaint', complaintSchema);
