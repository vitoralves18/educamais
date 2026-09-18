const express = require('express');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// GET /api/favorites
router.get('/', authRequired, (req, res) => {
  const favorites = db.prepare(
    `SELECT r.* FROM favorites f
     JOIN resources r ON r.id = f.resource_id
     WHERE f.user_id = ? ORDER BY f.created_at DESC`
  ).all(req.user.id);
  res.json({ favorites });
});

// POST /api/favorites/:resourceId
router.post('/:resourceId', authRequired, (req, res) => {
  const resource = db.prepare('SELECT id FROM resources WHERE id = ?').get(req.params.resourceId);
  if (!resource) return res.status(404).json({ error: 'Recurso não encontrado.' });

  db.prepare('INSERT OR IGNORE INTO favorites (user_id, resource_id) VALUES (?, ?)')
    .run(req.user.id, req.params.resourceId);
  res.status(201).json({ ok: true });
});

// DELETE /api/favorites/:resourceId
router.delete('/:resourceId', authRequired, (req, res) => {
  db.prepare('DELETE FROM favorites WHERE user_id = ? AND resource_id = ?')
    .run(req.user.id, req.params.resourceId);
  res.json({ ok: true });
});

// GET /api/favorites/history — histórico de materiais visualizados
router.get('/history/list', authRequired, (req, res) => {
  const history = db.prepare(
    `SELECT h.viewed_at, r.* FROM history h
     JOIN resources r ON r.id = h.resource_id
     WHERE h.user_id = ? ORDER BY h.viewed_at DESC LIMIT 50`
  ).all(req.user.id);
  res.json({ history });
});

module.exports = router;
