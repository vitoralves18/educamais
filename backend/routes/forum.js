const express = require('express');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// GET /api/forum/channels — Funcionalidade 5: Comunidade e suporte
router.get('/channels', authRequired, (req, res) => {
  const channels = db.prepare('SELECT * FROM forum_channels ORDER BY name').all();
  res.json({ channels });
});

// POST /api/forum/channels — criar novo canal/tópico
router.post('/channels', authRequired, (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Informe um nome para o canal.' });
  const info = db.prepare('INSERT INTO forum_channels (name) VALUES (?)').run(name.trim());
  const channel = db.prepare('SELECT * FROM forum_channels WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ channel });
});

// GET /api/forum/channels/:id/messages
router.get('/channels/:id/messages', authRequired, (req, res) => {
  const messages = db.prepare(
    `SELECT m.*, u.name AS author_name, u.role AS author_role FROM forum_messages m
     JOIN users u ON u.id = m.user_id
     WHERE m.channel_id = ? ORDER BY m.created_at ASC`
  ).all(req.params.id);
  res.json({ messages });
});

// POST /api/forum/channels/:id/messages
router.post('/channels/:id/messages', authRequired, (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'A mensagem não pode ser vazia.' });

  const channel = db.prepare('SELECT id FROM forum_channels WHERE id = ?').get(req.params.id);
  if (!channel) return res.status(404).json({ error: 'Canal não encontrado.' });

  const info = db.prepare(
    'INSERT INTO forum_messages (channel_id, user_id, content) VALUES (?, ?, ?)'
  ).run(req.params.id, req.user.id, content.trim());

  const message = db.prepare(
    `SELECT m.*, u.name AS author_name, u.role AS author_role FROM forum_messages m
     JOIN users u ON u.id = m.user_id WHERE m.id = ?`
  ).get(info.lastInsertRowid);

  res.status(201).json({ message });
});

module.exports = router;
