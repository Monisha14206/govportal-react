const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  required_documents: { type: String, default: '' },
  // Array of { name, label, type, required, options? } describing the
  // dynamic application form for this service.
  form_fields: { type: Array, default: [] },
  fee: { type: Number, default: 0 },
  processing_days: { type: Number, default: 7 },
  is_active: { type: Boolean, default: true }
}, schemaOptions);

module.exports = mongoose.model('Service', serviceSchema);
