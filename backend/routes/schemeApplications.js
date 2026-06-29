const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Scheme = require('../models/Scheme');
const SchemeApplication = require('../models/SchemeApplication');
const { attachUser, requireAuth } = require('../middleware/auth');
const { generateSchemeApplicationNumber } = require('../utils/generateId');
const { notifyUser } = require('../utils/notify');
const { safeFindById } = require('../utils/safeFindById');
const { shapeSchemeApplication, shapeHistory } = require('../utils/shape');

const uploadDir = path.join(__dirname, '..', 'uploads', 'scheme-applications');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('Only JPG, PNG and PDF files are allowed.'), ok);
  }
});

// Submit a scheme enrolment application with supporting documents
router.post('/schemes/:id/apply', attachUser, requireAuth, upload.any(), async (req, res) => {
  const scheme = await safeFindById(Scheme, req.params.id);
  if (!scheme || !scheme.is_active) return res.status(404).json({ error: 'Scheme not found.' });

  const fields = scheme.form_fields || [];
  const formData = {};
  for (const f of fields) formData[f.name] = req.body[f.name] || '';

  const documents = (req.files || []).map(file => ({
    field: file.fieldname,
    original_name: file.originalname,
    filename: file.filename,
    path: `/uploads/scheme-applications/${file.filename}`
  }));

  const applicationNumber = generateSchemeApplicationNumber();

  await SchemeApplication.create({
    application_number: applicationNumber,
    user: req.user.id,
    scheme: scheme.id,
    form_data: formData,
    documents,
    status: 'Submitted',
    statusHistory: [{ status: 'Submitted', remarks: 'Scheme application submitted by citizen.' }]
  });

  await notifyUser({
    user_id: req.user.id,
    email: req.user.email,
    phone: req.user.phone,
    subject: 'Scheme Application Submitted',
    message: `Your application for "${scheme.name}" has been submitted. Your Application Number is ${applicationNumber}. Use it to track status.`
  });

  res.status(201).json({ applicationNumber, scheme: { id: scheme.id, name: scheme.name } });
});

// Citizen's own scheme applications
router.get('/scheme-applications/mine', attachUser, requireAuth, async (req, res) => {
  const applications = await SchemeApplication.find({ user: req.user.id })
    .populate('scheme', 'name')
    .sort({ created_at: -1 });

  res.json({ applications: applications.map(shapeSchemeApplication) });
});

// Public status tracking by Application Number (no login required)
router.get('/scheme-applications/track/:applicationNumber', async (req, res) => {
  const application = await SchemeApplication.findOne({
    application_number: req.params.applicationNumber.trim()
  }).populate('scheme', 'name');

  if (!application) {
    return res.status(404).json({ error: 'No scheme application found with that Application Number.' });
  }

  res.json({
    application: shapeSchemeApplication(application),
    history: shapeHistory(application.statusHistory)
  });
});

module.exports = router;
