const express = require('express');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// GET /api/profile — Funcionalidade 2: Perfil personalizado
// Funcionalidade 4: Ferramentas de acessibilidade (retornadas junto do perfil)
router.get('/', authRequired, (req, res) => {
  const profile = db.prepare(
    `SELECT p.*, u.name, u.email, u.role
     FROM profiles p JOIN users u ON u.id = p.user_id
     WHERE p.user_id = ?`
  ).get(req.user.id);

  if (!profile) return res.status(404).json({ error: 'Perfil não encontrado.' });
  res.json({ profile });
});

// PUT /api/profile — atualizar preferências/necessidades
router.put('/', authRequired, (req, res) => {
  const { necessidades, font_size, high_contrast, screen_reader, bio } = req.body;

  const allowedFontSizes = ['small', 'medium', 'large'];
  const fs = allowedFontSizes.includes(font_size) ? font_size : 'medium';

  db.prepare(
    `UPDATE profiles
     SET necessidades = COALESCE(?, necessidades),
         font_size = ?,
         high_contrast = ?,
         screen_reader = ?,
         bio = COALESCE(?, bio)
     WHERE user_id = ?`
  ).run(
    necessidades ?? null,
    fs,
    high_contrast ? 1 : 0,
    screen_reader ? 1 : 0,
    bio ?? null,
    req.user.id
  );

  const profile = db.prepare(
    `SELECT p.*, u.name, u.email, u.role
     FROM profiles p JOIN users u ON u.id = p.user_id
     WHERE p.user_id = ?`
  ).get(req.user.id);

  res.json({ profile });
});

module.exports = router;
