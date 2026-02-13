require('dotenv').config();
const jwt = require('jsonwebtoken');

const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  PRIVATE_KEY,

  tokenValited(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Acesso indisponível, token não informado.',
      });
    }
    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return res.status(401).json({ error: 'Token mal formatado.' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ error: 'Token mal formatado.' });
    }

    try {
      const payload = jwt.verify(token, PRIVATE_KEY);

      if (!payload) {
        return res.status(401).json({ error: 'Token inválido.' });
      }

      req.user = payload;

      return next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado.' });
      }

      return res.status(401).json({ error: 'Token inválido.' });
    }
  },
};
