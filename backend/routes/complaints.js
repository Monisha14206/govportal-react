const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Complaint = require('../models/Complaint');
const { attachUser, requireAuth } = require('../middleware/auth');
const { generateComplaintNumber } = require('../utils/generateId');
const { notifyUser } = require('../utils/notify');
const { shapeComplaint, shapeHistory } = require('../utils/shape');

const uploadDir = path.join(__dirname, '..', 'uploads', 'complaints');
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

const CATEGORIES = [
  'Roads',
  'Water Supply',
  'Drainage',
  'Street Lights',
  'Electricity',
  'Sanitation & Waste',
  'Public Health',
  'Corruption / Misconduct',
  'Other'
];

router.get('/complaints/categories', (req, res) => {
  res.json({ categories: CATEGORIES });
});

router.post('/complaints', attachUser, requireAuth, upload.single('attachment'), async (req, res) => {
  const { category, subject, description, location } = req.body;

  if (!category || !subject || !description) {
    return res.status(400).json({ error: 'Category, subject and description are required.' });
  }

  const complaintNumber = generateComplaintNumber();
  const attachmentPath = req.file ? `/uploads/complaints/${req.file.filename}` : null;

  await Complaint.create({
    complaint_number: complaintNumber,
    user: req.user.id,
    category,
    subject,
    description,
    location: location || null,
    attachment_path: attachmentPath,
    status: 'Registered',
    statusHistory: [{ status: 'Registered', remarks: 'Complaint registered by citizen.' }]
  });

  await notifyUser({
    user_id: req.user.id,
    email: req.user.email,
    phone: req.user.phone,
    subject: 'Complaint Registered',
    message: `Your complaint "${subject}" has been registered. Your Complaint Number is ${complaintNumber}. Use it to track resolution status.`
  });

  res.status(201).json({ complaintNumber });
});

router.get('/complaints/mine', attachUser, requireAuth, async (req, res) => {
  const complaints = await Complaint.find({ user: req.user.id })
    .populate('user', 'name email')
    .sort({ created_at: -1 });

  res.json({ complaints: complaints.map(shapeComplaint) });
});

router.get('/complaints/track/:complaintNumber', async (req, res) => {
  const complaint = await Complaint.findOne({
    complaint_number: req.params.complaintNumber.trim()
  }).populate('user', 'name email');

  if (!complaint) {
    return res.status(404).json({ error: 'No complaint found with that Complaint Number.' });
  }

  res.json({
    complaint: shapeComplaint(complaint),
    history: shapeHistory(complaint.statusHistory)
  });
});

module.exports = router;
