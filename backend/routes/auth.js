const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authRequired, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register — Funcionalidade 1: Autenticação de usuários
router.post('/register', (req, res) => {
  const { name, email, password, confirmPassword, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Preencha nome, email, senha e perfil (aluno, tutor ou responsável).' });
  }
  if (!['aluno', 'tutor', 'responsavel'].includes(role)) {
    return res.status(400).json({ error: 'Perfil inválido.' });
  }
  if (confirmPassword !== undefined && confirmPassword !== password) {
    return res.status(400).json({ error: 'As senhas não coincidem.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    return res.status(409).json({ error: 'Já existe uma conta com este email.' });
  }

  const hash = bcrypt.hashSync(password, 10);

  const info = db.prepare(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
  ).run(name.trim(), email.toLowerCase().trim(), hash, role);

  const userId = info.lastInsertRowid;

  db.prepare('INSERT INTO profiles (user_id) VALUES (?)').run(userId);

  db.prepare('INSERT INTO notifications (user_id, message) VALUES (?, ?)').run(
    userId,
    `Bem-vindo(a) ao EducaMais+, ${name.trim()}! Explore a biblioteca de recursos e o fórum.`
  );

  const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(userId);
  const token = signToken(user);

  res.status(201).json({ token, user });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Informe email e senha.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ error: 'Email ou senha inválidos.' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Email ou senha inválidos.' });
  }

  const token = signToken(user);
  const { password_hash, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// GET /api/auth/me
router.get('/me', authRequired, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  res.json({ user });
});

module.exports = router;
