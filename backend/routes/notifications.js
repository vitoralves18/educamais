const express = require('express');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications — Funcionalidade 6: Notificações
router.get('/', authRequired, (req, res) => {
  const notifications = db.prepare(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
  ).all(req.user.id);
  const unreadCount = notifications.filter(n => !n.read).length;
  res.json({ notifications, unreadCount });
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authRequired, (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user.id);
  res.json({ ok: true });
});

// PUT /api/notifications/read-all
router.put('/read-all', authRequired, (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(req.user.id);
  res.json({ ok: true });
});

module.exports = router;
