require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const resourceRoutes = require('./routes/resources');
const favoriteRoutes = require('./routes/favorites');
const forumRoutes = require('./routes/forum');
const notificationRoutes = require('./routes/notifications');
const evaluationRoutes = require('./routes/evaluations');

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // permite chamadas sem origin (ex: curl, apps mobile) e localhost em dev
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin) || origin.includes('localhost')) {
      return callback(null, true);
    }
    callback(new Error('Origem não permitida pelo CORS: ' + origin));
  },
}));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'EducaMais+ API' }));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/evaluations', evaluationRoutes);

// 404 padrão
app.use('/api', (req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));

// Handler de erro genérico
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`EducaMais+ API rodando em http://localhost:${PORT}`);
  });
}
