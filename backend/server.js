require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const { init } = require('./config/db');
const { attachUser } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const applicationRoutes = require('./routes/applications');
const complaintRoutes = require('./routes/complaints');
const adminRoutes = require('./routes/admin');
const schemeRoutes = require('./routes/schemes');
const contactRoutes = require('./routes/contact');
const notificationRoutes = require('./routes/notifications');
const schemeApplicationRoutes = require('./routes/schemeApplications');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded documents/attachments as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(attachUser);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', authRoutes);
app.use('/api', serviceRoutes);
app.use('/api', applicationRoutes);
app.use('/api', complaintRoutes);
app.use('/api', adminRoutes);
app.use('/api', schemeRoutes);
app.use('/api', contactRoutes);
app.use('/api', notificationRoutes);
app.use('/api', schemeApplicationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Error handler (e.g. multer file-type/size errors)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 400).json({ error: err.message || 'Something went wrong.' });
});

async function start() {
  await init(); // connect to MongoDB Atlas + seed initial data
  app.listen(PORT, () => {
    console.log(`Sachivalayam Portal API running at http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
