const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'educamais-dev-secret-troque-em-producao';

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido. Faça login novamente.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, name, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

function roleRequired(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Você não tem permissão para acessar este recurso.' });
    }
    next();
  };
}

module.exports = { authRequired, roleRequired, JWT_SECRET };
