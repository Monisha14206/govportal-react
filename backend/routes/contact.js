const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const { sendEmail } = require('../utils/notify');

// Public: simple contact form submission
router.post('/contact', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required.' });
  }

  await ContactMessage.create({
    name,
    email,
    phone: phone || null,
    subject: subject || 'General Enquiry',
    message
  });

  // Notify the portal admin inbox (simulated unless SMTP is configured)
  await sendEmail({
    to: process.env.ADMIN_EMAIL || 'admin@govportal.local',
    subject: `New Contact Message: ${subject || 'General Enquiry'}`,
    text: `From: ${name} (${email}${phone ? ', ' + phone : ''})\n\n${message}`
  });

  res.status(201).json({ success: true, message: 'Your message has been received. Our team will get back to you soon.' });
});

module.exports = router;
