const express = require('express');
const router = express.Router();
const db = require('../db');

// Public search endpoint
router.get('/', (req, res) => {
  const q = req.query.q || req.query.query || '';
  const results = db.findResourcesByQuery(q);
  res.json({ results });
});

// Get single resource
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const all = db.listResources();
  const resource = all.find(r => r.id === id);
  if (!resource) return res.status(404).json({ error: 'Not found' });
  res.json({ resource });
});

module.exports = router;
