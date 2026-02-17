require('dotenv').config();
const jwt = require('jsonwebtoken');

const PRIVATE_KEY = process.env.PRIVATE_KEY;

function verifyToken(token) {
    return jwt.verify(token, PRIVATE_KEY);
}

module.exports = {
    PRIVATE_KEY,
    verifyToken,

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
            const payload = verifyToken(token);

            req.user = payload;

            return next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expirado.' });
            }

            return res.status(401).json({ error: 'Token inválido.' });
        }
    },

    onlyAdmin(req, res, next) {
        if (!req.user) {
            return res.status(401).json({
                error: 'Usuário não autenticado.',
            });
        }

        if (req.user.tipo !== 'admin') {
            return res.status(403).json({
                error: 'Acesso permitido apenas para administradores.',
            });
        }

        return next();
    },

    onlyAdminOrMedico(req, res, next) {
        if (!req.user) {
            return res.status(401).json({
                error: 'Usuário não autenticado.',
            });
        }

        if (req.user.tipo !== 'admin' && req.user.tipo !== 'medico') {
            return res.status(403).json({
                error: 'Acesso permitido apenas para administradores.',
            });
        }

        return next();
    },
};
