const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { attachUser, requireAuth } = require('../middleware/auth');
const { shapeNotification } = require('../utils/shape');

// Citizen's own notifications (most recent first)
router.get('/notifications/mine', attachUser, requireAuth, async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id })
    .sort({ created_at: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({ user: req.user.id, read: false });

  res.json({ notifications: notifications.map(shapeNotification), unreadCount });
});

// Mark a single notification as read
router.put('/notifications/:id/read', attachUser, requireAuth, async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user.id });
  if (!notification) return res.status(404).json({ error: 'Notification not found.' });

  notification.read = true;
  await notification.save();
  res.json({ success: true });
});

// Mark everything as read (used when the bell dropdown is opened)
router.put('/notifications/mark-all-read', attachUser, requireAuth, async (req, res) => {
  await Notification.updateMany({ user: req.user.id, read: false }, { $set: { read: true } });
  res.json({ success: true });
});

module.exports = router;
