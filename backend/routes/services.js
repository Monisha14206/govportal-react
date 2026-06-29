const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { safeFindById } = require('../utils/safeFindById');

router.get('/services', async (req, res) => {
  const { q, category } = req.query;

  const filter = { is_active: true };
  if (q) {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: regex }, { description: regex }];
  }
  if (category) filter.category = category;

  const services = await Service.find(filter).sort({ name: 1 });
  const categories = await Service.distinct('category', { is_active: true });

  res.json({ services, categories });
});

router.get('/services/:id', async (req, res) => {
  const service = await safeFindById(Service, req.params.id);
  if (!service) return res.status(404).json({ error: 'Service not found.' });

  res.json({ service });
});

module.exports = router;
