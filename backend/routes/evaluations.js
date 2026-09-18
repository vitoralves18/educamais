const express = require('express');
const db = require('../db');
const { authRequired, roleRequired } = require('../middleware/auth');

const router = express.Router();

// GET /api/evaluations/students — lista de alunos (para o tutor avaliar)
router.get('/students', authRequired, roleRequired('tutor'), (req, res) => {
  const students = db.prepare(`SELECT id, name, email FROM users WHERE role = 'aluno' ORDER BY name`).all();
  res.json({ students });
});

// POST /api/evaluations — Tutor avalia aluno / registra progresso
router.post('/', authRequired, roleRequired('tutor'), (req, res) => {
  const { student_id, note, progress } = req.body;
  if (!student_id || !note) {
    return res.status(400).json({ error: 'Informe o aluno e uma observação.' });
  }
  const student = db.prepare(`SELECT id FROM users WHERE id = ? AND role = 'aluno'`).get(student_id);
  if (!student) return res.status(404).json({ error: 'Aluno não encontrado.' });

  const info = db.prepare(
    'INSERT INTO student_evaluations (tutor_id, student_id, note, progress) VALUES (?, ?, ?, ?)'
  ).run(req.user.id, student_id, note, Math.max(0, Math.min(100, progress || 0)));

  // Notifica o aluno
  db.prepare('INSERT INTO notifications (user_id, message) VALUES (?, ?)').run(
    student_id, `Seu tutor registrou uma nova avaliação de progresso.`
  );

  const evaluation = db.prepare('SELECT * FROM student_evaluations WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ evaluation });
});

// GET /api/evaluations/student/:studentId — progresso de um aluno (Aluno vê o próprio; Responsável/Tutor veem qualquer um)
router.get('/student/:studentId', authRequired, (req, res) => {
  const { studentId } = req.params;

  if (req.user.role === 'aluno' && Number(studentId) !== req.user.id) {
    return res.status(403).json({ error: 'Você só pode ver seu próprio progresso.' });
  }

  const evaluations = db.prepare(
    `SELECT e.*, u.name AS tutor_name FROM student_evaluations e
     JOIN users u ON u.id = e.tutor_id
     WHERE e.student_id = ? ORDER BY e.created_at DESC`
  ).all(studentId);

  res.json({ evaluations });
});

module.exports = router;
