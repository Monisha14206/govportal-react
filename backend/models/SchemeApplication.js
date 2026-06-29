const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');
const statusHistorySchema = require('./statusHistorySchema');

const documentSchema = new mongoose.Schema({
  field: String,
  original_name: String,
  filename: String,
  path: String
}, { _id: false });

// Mirrors Application.js, but for welfare-scheme enrolment instead of a
// service. Kept as a separate model (rather than reusing Application) so
// admin reporting and citizen "My Applications" vs "My Scheme Applications"
// stay cleanly separated.
const schemeApplicationSchema = new mongoose.Schema({
  application_number: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheme: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme', required: true },
  form_data: { type: Object, default: {} },
  documents: { type: [documentSchema], default: [] },
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Completed'],
    default: 'Submitted'
  },
  remarks: { type: String, default: null },
  statusHistory: { type: [statusHistorySchema], default: [] },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, schemaOptions);

module.exports = mongoose.model('SchemeApplication', schemeApplicationSchema);
