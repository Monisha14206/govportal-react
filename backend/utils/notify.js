const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');
require('dotenv').config();

let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function logNotification({ user_id, channel, recipient, message, status }) {
  try {
    await Notification.create({ user: user_id || null, channel, recipient, message, status });
  } catch (err) {
    console.error('[NOTIFICATION LOG ERROR]', err.message);
  }
}

async function sendEmail({ user_id, to, subject, text }) {
  if (!to) return;
  try {
    if (transporter) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'Sachivalayam Portal <no-reply@govportal.local>',
        to,
        subject,
        text
      });
      await logNotification({ user_id, channel: 'email', recipient: to, message: `${subject}: ${text}`, status: 'sent' });
    } else {
      console.log(`[EMAIL - SIMULATED] To: ${to} | Subject: ${subject} | Body: ${text}`);
      await logNotification({ user_id, channel: 'email', recipient: to, message: `${subject}: ${text}`, status: 'simulated' });
    }
  } catch (err) {
    console.error('[EMAIL ERROR]', err.message);
    await logNotification({ user_id, channel: 'email', recipient: to, message: `${subject}: ${text}`, status: 'failed' });
  }
}

/**
 * SMS placeholder. Wire this up to Twilio / MSG91 / any SMS gateway by
 * implementing the fetch call below using SMS_API_URL and SMS_API_KEY.
 */
async function sendSMS({ user_id, to, message }) {
  if (!to) return;
  try {
    if (process.env.SMS_API_URL && process.env.SMS_API_KEY) {
      // Example integration point - adapt to your SMS provider's API contract:
      // await fetch(process.env.SMS_API_URL, {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${process.env.SMS_API_KEY}`, 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ to, message })
      // });
      await logNotification({ user_id, channel: 'sms', recipient: to, message, status: 'sent' });
    } else {
      console.log(`[SMS - SIMULATED] To: ${to} | Message: ${message}`);
      await logNotification({ user_id, channel: 'sms', recipient: to, message, status: 'simulated' });
    }
  } catch (err) {
    console.error('[SMS ERROR]', err.message);
    await logNotification({ user_id, channel: 'sms', recipient: to, message, status: 'failed' });
  }
}

async function notifyUser({ user_id, email, phone, subject, message }) {
  await sendEmail({ user_id, to: email, subject, text: message });
  await sendSMS({ user_id, to: phone, message: `${subject}: ${message}` });
}

module.exports = { sendEmail, sendSMS, notifyUser };
