const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Service = require('../models/Service');
const Application = require('../models/Application');
const Complaint = require('../models/Complaint');
const Scheme = require('../models/Scheme');
const SchemeApplication = require('../models/SchemeApplication');
const ContactMessage = require('../models/ContactMessage');
const { attachUser, requireAuth, requireAdmin } = require('../middleware/auth');
const { notifyUser } = require('../utils/notify');
const { safeFindById } = require('../utils/safeFindById');
const { shapeApplication, shapeComplaint, shapeSchemeApplication, shapeContactMessage, shapeUser } = require('../utils/shape');

router.use('/admin', attachUser, requireAuth, requireAdmin);

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.get('/admin/dashboard', async (req, res) => {
  const [
    totalUsers,
    totalApplications,
    pendingApplications,
    totalComplaints,
    openComplaints,
    totalSchemeApplications,
    pendingSchemeApplications,
    unreadContactMessages,
    recentApplicationsRaw,
    recentComplaintsRaw,
    applicationStatusBreakdownRaw,
    complaintCategoryBreakdownRaw
  ] = await Promise.all([
    User.countDocuments({ role: 'citizen' }),
    Application.countDocuments(),
    Application.countDocuments({ status: { $in: ['Submitted', 'Under Review'] } }),
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: { $in: ['Registered', 'In Progress'] } }),
    SchemeApplication.countDocuments(),
    SchemeApplication.countDocuments({ status: { $in: ['Submitted', 'Under Review'] } }),
    ContactMessage.countDocuments({ is_read: false }),
    Application.find().populate('service', 'name').populate('user', 'name email').sort({ created_at: -1 }).limit(5),
    Complaint.find().populate('user', 'name email').sort({ created_at: -1 }).limit(5),
    Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }])
  ]);

  const stats = {
    totalUsers, totalApplications, pendingApplications, totalComplaints, openComplaints,
    totalSchemeApplications, pendingSchemeApplications, unreadContactMessages
  };
  const recentApplications = recentApplicationsRaw.map(shapeApplication);
  const recentComplaints = recentComplaintsRaw.map(shapeComplaint);
  const applicationStatusBreakdown = applicationStatusBreakdownRaw.map(r => ({ status: r._id, count: r.count }));
  const complaintCategoryBreakdown = complaintCategoryBreakdownRaw.map(r => ({ category: r._id, count: r.count }));

  res.json({ stats, recentApplications, recentComplaints, applicationStatusBreakdown, complaintCategoryBreakdown });
});

// --- Applications management ---
router.get('/admin/applications', async (req, res) => {
  const { status, q } = req.query;
  const filter = {};
  if (status) filter.status = status;

  let query = Application.find(filter).populate('service', 'name').populate('user', 'name email');

  if (q) {
    const regex = new RegExp(escapeRegex(q), 'i');
    // application_number lives on Application; applicant name lives on the
    // populated User, so fetch the matching user ids first.
    const matchingUsers = await User.find({ name: regex }).select('_id');
    const userIds = matchingUsers.map(u => u._id);
    query = query.find({
      $or: [
        { application_number: regex },
        { user: { $in: userIds } }
      ]
    });
  }

  const applications = await query.sort({ created_at: -1 });
  res.json({
    applications: applications.map(shapeApplication),
    statuses: ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Completed']
  });
});

router.put('/admin/applications/:id/status', async (req, res) => {
  const { status, remarks } = req.body;
  const application = await safeFindById(Application, req.params.id);
  if (!application) return res.status(404).json({ error: 'Application not found.' });

  await application.populate('service', 'name');
  await application.populate('user', 'name email phone');

  application.status = status;
  application.remarks = remarks || null;
  application.updated_at = new Date();
  application.statusHistory.push({ status, remarks: remarks || null });
  await application.save();

  await notifyUser({
    user_id: application.user.id,
    email: application.user.email,
    phone: application.user.phone,
    subject: 'Application Status Update',
    message: `Your application ${application.application_number} for "${application.service.name}" is now: ${status}.${remarks ? ' Remarks: ' + remarks : ''}`
  });

  res.json({ success: true });
});

// --- Complaints management ---
router.get('/admin/complaints', async (req, res) => {
  const { status, q } = req.query;
  const filter = {};
  if (status) filter.status = status;

  let query = Complaint.find(filter).populate('user', 'name email');

  if (q) {
    const regex = new RegExp(escapeRegex(q), 'i');
    const matchingUsers = await User.find({ name: regex }).select('_id');
    const userIds = matchingUsers.map(u => u._id);
    query = query.find({
      $or: [
        { complaint_number: regex },
        { subject: regex },
        { user: { $in: userIds } }
      ]
    });
  }

  const complaints = await query.sort({ created_at: -1 });
  res.json({
    complaints: complaints.map(shapeComplaint),
    statuses: ['Registered', 'In Progress', 'Resolved', 'Rejected']
  });
});

router.put('/admin/complaints/:id/status', async (req, res) => {
  const { status, remarks } = req.body;
  const complaint = await safeFindById(Complaint, req.params.id);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });

  await complaint.populate('user', 'name email phone');

  complaint.status = status;
  complaint.remarks = remarks || null;
  complaint.updated_at = new Date();
  complaint.statusHistory.push({ status, remarks: remarks || null });
  await complaint.save();

  await notifyUser({
    user_id: complaint.user.id,
    email: complaint.user.email,
    phone: complaint.user.phone,
    subject: 'Complaint Status Update',
    message: `Your complaint ${complaint.complaint_number} ("${complaint.subject}") is now: ${status}.${remarks ? ' Remarks: ' + remarks : ''}`
  });

  res.json({ success: true });
});

// --- Scheme applications management ---
router.get('/admin/scheme-applications', async (req, res) => {
  const { status, q } = req.query;
  const filter = {};
  if (status) filter.status = status;

  let query = SchemeApplication.find(filter).populate('scheme', 'name').populate('user', 'name email');

  if (q) {
    const regex = new RegExp(escapeRegex(q), 'i');
    const matchingUsers = await User.find({ name: regex }).select('_id');
    const userIds = matchingUsers.map(u => u._id);
    query = query.find({
      $or: [
        { application_number: regex },
        { user: { $in: userIds } }
      ]
    });
  }

  const applications = await query.sort({ created_at: -1 });
  res.json({
    applications: applications.map(shapeSchemeApplication),
    statuses: ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Completed']
  });
});

router.put('/admin/scheme-applications/:id/status', async (req, res) => {
  const { status, remarks } = req.body;
  const application = await safeFindById(SchemeApplication, req.params.id);
  if (!application) return res.status(404).json({ error: 'Scheme application not found.' });

  await application.populate('scheme', 'name');
  await application.populate('user', 'name email phone');

  application.status = status;
  application.remarks = remarks || null;
  application.updated_at = new Date();
  application.statusHistory.push({ status, remarks: remarks || null });
  await application.save();

  await notifyUser({
    user_id: application.user.id,
    email: application.user.email,
    phone: application.user.phone,
    subject: 'Scheme Application Status Update',
    message: `Your scheme application ${application.application_number} for "${application.scheme.name}" is now: ${status}.${remarks ? ' Remarks: ' + remarks : ''}`
  });

  res.json({ success: true });
});

// --- Services management ---
router.get('/admin/services', async (req, res) => {
  const services = await Service.find().sort({ category: 1, name: 1 });
  res.json({ services });
});

router.put('/admin/services/:id/toggle', async (req, res) => {
  const service = await safeFindById(Service, req.params.id);
  if (!service) return res.status(404).json({ error: 'Service not found.' });

  service.is_active = !service.is_active;
  await service.save();
  res.json({ success: true });
});

// --- Schemes management ---
router.get('/admin/schemes', async (req, res) => {
  const schemes = await Scheme.find().sort({ category: 1, name: 1 });
  res.json({ schemes });
});

router.put('/admin/schemes/:id/toggle', async (req, res) => {
  const scheme = await safeFindById(Scheme, req.params.id);
  if (!scheme) return res.status(404).json({ error: 'Scheme not found.' });

  scheme.is_active = !scheme.is_active;
  await scheme.save();
  res.json({ success: true });
});

// --- User management ---
router.get('/admin/users', async (req, res) => {
  const { q, role } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (q) {
    const regex = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }

  const users = await User.find(filter).sort({ created_at: -1 });
  res.json({ users: users.map(shapeUser) });
});

router.put('/admin/users/:id/role', async (req, res) => {
  const { role } = req.body;
  if (!['citizen', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Role must be "citizen" or "admin".' });
  }
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'You cannot change your own role.' });
  }

  const userDoc = await safeFindById(User, req.params.id);
  if (!userDoc) return res.status(404).json({ error: 'User not found.' });

  userDoc.role = role;
  await userDoc.save();
  res.json({ success: true });
});

router.put('/admin/users/:id/toggle', async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'You cannot deactivate your own account.' });
  }

  const userDoc = await safeFindById(User, req.params.id);
  if (!userDoc) return res.status(404).json({ error: 'User not found.' });

  userDoc.is_active = !userDoc.is_active;
  await userDoc.save();
  res.json({ success: true });
});

// --- Contact messages ---
router.get('/admin/contact-messages', async (req, res) => {
  const { q, unread } = req.query;
  const filter = {};
  if (unread === 'true') filter.is_read = false;
  if (q) {
    const regex = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: regex }, { email: regex }, { subject: regex }, { message: regex }];
  }

  const messages = await ContactMessage.find(filter).sort({ created_at: -1 });
  res.json({ messages: messages.map(shapeContactMessage) });
});

router.put('/admin/contact-messages/:id/read', async (req, res) => {
  const message = await safeFindById(ContactMessage, req.params.id);
  if (!message) return res.status(404).json({ error: 'Message not found.' });

  message.is_read = true;
  await message.save();
  res.json({ success: true });
});

module.exports = router;
