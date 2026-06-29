const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken, attachUser, requireAuth } = require('../middleware/auth');
const { sendEmail } = require('../utils/notify');

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

router.post('/register', async (req, res) => {
  const { name, email, phone, password, confirm_password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }
  if (password !== confirm_password) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const userDoc = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone || null,
    password_hash,
    role: 'citizen'
  });

  const user = {
    id: userDoc.id,
    name: userDoc.name,
    email: userDoc.email,
    phone: userDoc.phone,
    role: userDoc.role
  };

  await sendEmail({
    user_id: user.id,
    to: user.email,
    subject: 'Welcome to Sachivalayam Portal',
    text: `Hi ${user.name}, your citizen account has been created successfully. You can now apply for services and lodge complaints online.`
  });

  const token = signToken(user);
  res.status(201).json({ token, user });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const row = await User.findOne({ email: (email || '').toLowerCase().trim() });

  if (!row) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const match = await bcrypt.compare(password || '', row.password_hash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (row.is_active === false) {
    return res.status(403).json({ error: 'This account has been deactivated. Please contact support.' });
  }

  const user = { id: row.id, name: row.name, email: row.email, phone: row.phone, role: row.role };
  const token = signToken(user);
  res.json({ token, user });
});

// Returns the currently authenticated user (used by the frontend on page load
// to restore session state from a stored token).
router.get('/me', attachUser, requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// Update own profile (name, phone). Email/role are not editable here.
router.put('/me', attachUser, requireAuth, async (req, res) => {
  const { name, phone } = req.body;
  const userDoc = await User.findById(req.user.id);
  if (!userDoc) return res.status(404).json({ error: 'User not found.' });

  if (name && name.trim()) userDoc.name = name.trim();
  if (phone !== undefined) userDoc.phone = phone || null;
  await userDoc.save();

  const user = { id: userDoc.id, name: userDoc.name, email: userDoc.email, phone: userDoc.phone, role: userDoc.role };
  const token = signToken(user); // re-sign so the JWT payload reflects the new name/phone
  res.json({ token, user });
});

// Change own password
router.put('/me/password', attachUser, requireAuth, async (req, res) => {
  const { current_password, new_password, confirm_new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Current and new password are required.' });
  }
  if (new_password !== confirm_new_password) {
    return res.status(400).json({ error: 'New passwords do not match.' });
  }
  if (new_password.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  const userDoc = await User.findById(req.user.id);
  if (!userDoc) return res.status(404).json({ error: 'User not found.' });

  const match = await bcrypt.compare(current_password, userDoc.password_hash);
  if (!match) return res.status(401).json({ error: 'Current password is incorrect.' });

  userDoc.password_hash = await bcrypt.hash(new_password, 10);
  await userDoc.save();

  res.json({ success: true, message: 'Password updated successfully.' });
});

// Request a password reset link. Always responds with success (even if the
// email isn't registered) so this endpoint can't be used to enumerate accounts.
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const generic = { success: true, message: 'If an account exists for that email, a reset link has been sent.' };

  if (!email) return res.json(generic);

  const userDoc = await User.findOne({ email: email.toLowerCase().trim() });
  if (!userDoc) return res.json(generic);

  const rawToken = crypto.randomBytes(32).toString('hex');
  userDoc.reset_token_hash = hashToken(rawToken);
  userDoc.reset_token_expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await userDoc.save();

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(userDoc.email)}`;

  await sendEmail({
    user_id: userDoc.id,
    to: userDoc.email,
    subject: 'Reset Your Sachivalayam Portal Password',
    text: `Hi ${userDoc.name}, we received a request to reset your password. Click the link below (valid for 1 hour):\n\n${resetLink}\n\nIf you didn't request this, you can safely ignore this email.`
  });

  res.json(generic);
});

// Complete a password reset using the emailed token
router.post('/reset-password', async (req, res) => {
  const { email, token, new_password, confirm_new_password } = req.body;

  if (!email || !token || !new_password) {
    return res.status(400).json({ error: 'Email, token and new password are required.' });
  }
  if (new_password !== confirm_new_password) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }
  if (new_password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const userDoc = await User.findOne({ email: email.toLowerCase().trim() });
  if (!userDoc || !userDoc.reset_token_hash || !userDoc.reset_token_expires) {
    return res.status(400).json({ error: 'Invalid or expired reset link.' });
  }
  if (userDoc.reset_token_expires < new Date()) {
    return res.status(400).json({ error: 'This reset link has expired. Please request a new one.' });
  }
  if (hashToken(token) !== userDoc.reset_token_hash) {
    return res.status(400).json({ error: 'Invalid or expired reset link.' });
  }

  userDoc.password_hash = await bcrypt.hash(new_password, 10);
  userDoc.reset_token_hash = null;
  userDoc.reset_token_expires = null;
  await userDoc.save();

  res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
});

module.exports = router;
