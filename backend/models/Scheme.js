const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const schemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  eligibility: { type: String, default: '' },
  benefits: { type: String, default: '' },
  required_documents: { type: String, default: 'Aadhaar Card, Address Proof' },
  // Array of { name, label, type, required, options? } describing the
  // dynamic enrolment form for this scheme - same shape as Service.form_fields.
  form_fields: {
    type: Array,
    default: [
      { name: 'applicant_name', label: 'Applicant Name', type: 'text', required: true },
      { name: 'applicant_phone', label: 'Contact Phone Number', type: 'tel', required: true },
      { name: 'address', label: 'Residential Address', type: 'textarea', required: true }
    ]
  },
  is_active: { type: Boolean, default: true }
}, schemaOptions);

module.exports = mongoose.model('Scheme', schemeSchema);
