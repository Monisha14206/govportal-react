const mongoose = require('mongoose');

// Embedded subdocument used by both Application and Complaint to record
// every status change over time (replaces the old application_history /
// complaint_history tables - now lives directly on the parent document).
const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  remarks: { type: String, default: null },
  created_at: { type: Date, default: Date.now }
});

module.exports = statusHistorySchema;
