const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Service = require('../models/Service');
const Application = require('../models/Application');
const { attachUser, requireAuth } = require('../middleware/auth');
const { generateApplicationNumber } = require('../utils/generateId');
const { notifyUser } = require('../utils/notify');
const { safeFindById } = require('../utils/safeFindById');
const { shapeApplication, shapeHistory } = require('../utils/shape');

const uploadDir = path.join(__dirname, '..', 'uploads', 'applications');
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

// Submit application with documents
router.post('/services/:id/apply', attachUser, requireAuth, upload.any(), async (req, res) => {
  const service = await safeFindById(Service, req.params.id);
  if (!service) return res.status(404).json({ error: 'Service not found.' });

  const fields = service.form_fields || [];
  const formData = {};
  for (const f of fields) formData[f.name] = req.body[f.name] || '';

  const documents = (req.files || []).map(file => ({
    field: file.fieldname,
    original_name: file.originalname,
    filename: file.filename,
    path: `/uploads/applications/${file.filename}`
  }));

  const applicationNumber = generateApplicationNumber();

  await Application.create({
    application_number: applicationNumber,
    user: req.user.id,
    service: service.id,
    form_data: formData,
    documents,
    status: 'Submitted',
    statusHistory: [{ status: 'Submitted', remarks: 'Application submitted by citizen.' }]
  });

  await notifyUser({
    user_id: req.user.id,
    email: req.user.email,
    phone: req.user.phone,
    subject: 'Application Submitted',
    message: `Your application for "${service.name}" has been submitted. Your Application Number is ${applicationNumber}. Use it to track status.`
  });

  res.status(201).json({ applicationNumber, service: { id: service.id, name: service.name } });
});

// Citizen's own applications
router.get('/applications/mine', attachUser, requireAuth, async (req, res) => {
  const applications = await Application.find({ user: req.user.id })
    .populate('service', 'name')
    .sort({ created_at: -1 });

  res.json({ applications: applications.map(shapeApplication) });
});

// Public status tracking by Application Number (no login required)
router.get('/applications/track/:applicationNumber', async (req, res) => {
  const application = await Application.findOne({
    application_number: req.params.applicationNumber.trim()
  }).populate('service', 'name');

  if (!application) {
    return res.status(404).json({ error: 'No application found with that Application Number.' });
  }

  res.json({
    application: shapeApplication(application),
    history: shapeHistory(application.statusHistory)
  });
});

module.exports = router;
