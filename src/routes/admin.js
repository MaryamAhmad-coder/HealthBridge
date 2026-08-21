const express = require('express');
const router = express.Router();
const db = require('../db');

function authMiddleware(req, res, next) {
  const token = req.headers['x-admin-token'] || '';
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

router.use(authMiddleware);

router.get('/resources', (req, res) => {
  res.json({ results: db.listResources() });
});

router.post('/resources', (req, res) => {
  const item = req.body;
  if (!item || !item.title) return res.status(400).json({ error: 'title required' });
  const r = db.addResource(item);
  res.json({ resource: r });
});

router.put('/resources/:id', (req, res) => {
  const id = Number(req.params.id);
  const r = db.updateResource(id, req.body);
  if (!r) return res.status(404).json({ error: 'Not found' });
  res.json({ resource: r });
});

router.delete('/resources/:id', (req, res) => {
  const id = Number(req.params.id);
  const ok = db.deleteResource(id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

module.exports = router;
