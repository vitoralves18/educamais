const express = require('express');
const db = require('../db');
const { authRequired, roleRequired } = require('../middleware/auth');

const router = express.Router();

// GET /api/resources — Funcionalidade 3 (biblioteca) + 7 (pesquisa avançada)
// Query params: q (texto), subject, type
router.get('/', authRequired, (req, res) => {
  const { q, subject, type } = req.query;

  let sql = `SELECT r.*, u.name AS author_name FROM resources r
             LEFT JOIN users u ON u.id = r.created_by WHERE 1=1`;
  const params = [];

  if (q) {
    sql += ` AND (r.title LIKE ? OR r.description LIKE ? OR r.tags LIKE ?)`;
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  if (subject) {
    sql += ` AND r.subject = ?`;
    params.push(subject);
  }
  if (type) {
    sql += ` AND r.type = ?`;
    params.push(type);
  }
  sql += ` ORDER BY r.created_at DESC`;

  const resources = db.prepare(sql).all(...params);
  res.json({ resources });
});

// GET /api/resources/subjects — lista de assuntos distintos (apoio à pesquisa avançada)
router.get('/subjects', authRequired, (req, res) => {
  const rows = db.prepare(`SELECT DISTINCT subject FROM resources WHERE subject != '' ORDER BY subject`).all();
  res.json({ subjects: rows.map(r => r.subject) });
});

// GET /api/resources/:id
router.get('/:id', authRequired, (req, res) => {
  const resource = db.prepare(
    `SELECT r.*, u.name AS author_name FROM resources r
     LEFT JOIN users u ON u.id = r.created_by WHERE r.id = ?`
  ).get(req.params.id);

  if (!resource) return res.status(404).json({ error: 'Recurso não encontrado.' });

  db.prepare('INSERT INTO history (user_id, resource_id) VALUES (?, ?)').run(req.user.id, resource.id);

  res.json({ resource });
});

// POST /api/resources — apenas tutores podem publicar materiais
router.post('/', authRequired, roleRequired('tutor'), (req, res) => {
  const { title, description, content, type, subject, tags } = req.body;

  if (!title || !type) {
    return res.status(400).json({ error: 'Título e tipo do material são obrigatórios.' });
  }
  if (!['video', 'texto', 'atividade'].includes(type)) {
    return res.status(400).json({ error: 'Tipo inválido. Use video, texto ou atividade.' });
  }

  const info = db.prepare(
    `INSERT INTO resources (title, description, content, type, subject, tags, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(title, description || '', content || '', type, subject || '', tags || '', req.user.id);

  // Funcionalidade 6: Notificações — avisa alunos sobre novo recurso
  const students = db.prepare(`SELECT id FROM users WHERE role = 'aluno'`).all();
  const insertNotif = db.prepare('INSERT INTO notifications (user_id, message) VALUES (?, ?)');
  for (const s of students) {
    insertNotif.run(s.id, `Novo material disponível: "${title}"`);
  }

  const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ resource });
});

// DELETE /api/resources/:id — autor pode remover
router.delete('/:id', authRequired, roleRequired('tutor'), (req, res) => {
  const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id);
  if (!resource) return res.status(404).json({ error: 'Recurso não encontrado.' });
  if (resource.created_by !== req.user.id) {
    return res.status(403).json({ error: 'Você só pode remover materiais que você publicou.' });
  }
  db.prepare('DELETE FROM resources WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
