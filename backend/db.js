// db.js — conexão e schema do banco (usa o módulo nativo node:sqlite do Node.js 22+)
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'educamais.db');
const db = new DatabaseSync(dbPath);

db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('aluno','tutor','responsavel')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  necessidades TEXT DEFAULT '',
  font_size TEXT DEFAULT 'medium',   -- small | medium | large
  high_contrast INTEGER DEFAULT 0,   -- 0 | 1
  screen_reader INTEGER DEFAULT 0,   -- 0 | 1
  bio TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  content TEXT DEFAULT '',
  type TEXT NOT NULL CHECK(type IN ('video','texto','atividade')),
  subject TEXT DEFAULT '',
  tags TEXT DEFAULT '',
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, resource_id)
);

CREATE TABLE IF NOT EXISTS history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
  viewed_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS forum_channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS forum_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id INTEGER REFERENCES forum_channels(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS student_evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tutor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  progress INTEGER DEFAULT 0, -- 0-100
  created_at TEXT DEFAULT (datetime('now'))
);
`);

module.exports = db;
