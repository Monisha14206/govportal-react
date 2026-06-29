const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');
const { safeFindById } = require('../utils/safeFindById');

// Public: list / search / filter government schemes
router.get('/schemes', async (req, res) => {
  const { q, category } = req.query;

  const filter = { is_active: true };
  if (q) {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: regex }, { description: regex }];
  }
  if (category) filter.category = category;

  const schemes = await Scheme.find(filter).sort({ name: 1 });
  const categories = await Scheme.distinct('category', { is_active: true });

  res.json({ schemes, categories });
});

// Public: scheme detail (used by the scheme application form)
router.get('/schemes/:id', async (req, res) => {
  const scheme = await safeFindById(Scheme, req.params.id);
  if (!scheme || !scheme.is_active) {
    return res.status(404).json({ error: 'Scheme not found.' });
  }
  res.json({ scheme });
});

module.exports = router;
