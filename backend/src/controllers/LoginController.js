const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Usuario } = require('../models/Usuario');

const PRIVATE_KEY = process.env.PRIVATE_KEY;

function sanitize(usuario) {
    const data = usuario?.toJSON ? usuario.toJSON() : usuario;
    if (!data) return null;
    delete data.senha;
    return data;
}

module.exports = {
    async login(req, res) {
        try {
            const { email, senha } = req.body;

            if (!email || !senha) {
                return res.status(400).json({ error: 'Informe email e senha.' });
            }

            const usuario = await Usuario.findOne({ where: { email } });

            if (!usuario) {
                return res.status(401).json({ error: 'Email ou senha inválidos.' });
            }

            const ok = await bcrypt.compare(senha, usuario.senha || '');

            if (!ok) {
                return res.status(401).json({ error: 'Email ou senha inválidos.' });
            }

            if (!PRIVATE_KEY) {
                return res.status(500).json({ error: 'PRIVATE_KEY não configurada no .env.' });
            }

            const payload = {
                id: usuario.id,
                tipo: usuario.tipo,
                email: usuario.email,
                nome: usuario.nome,
            };

            const token = jwt.sign(payload, PRIVATE_KEY, { expiresIn: '7d' });

            req.io?.emit('auth:login', { usuario_id: usuario.id });

            return res.json({
                token,
                usuario: sanitize(usuario),
            });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },
};
