const bcrypt = require('bcryptjs');
const { Usuario } = require('../models/Usuario');

function sanitize(usuario) {
    const data = usuario?.toJSON ? usuario.toJSON() : usuario;
    if (!data) return null;
    delete data.senha;
    return data;
}

module.exports = {
    async create(req, res) {
        try {
            const { senha, ...rest } = req.body;

            let senhaCriptografada = null;

            if (senha) {
                senhaCriptografada = await bcrypt.hash(senha, 10);
            }

            const usuario = await Usuario.create({
                ...rest,
                senha: senhaCriptografada,
            });

            req.io?.emit('usuario:created', {
                id: usuario.id,
                data: sanitize(usuario),
            });

            return res.json(sanitize(usuario));
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async list(req, res) {
        try {
            const where = {};
            if (req.query.tipo) where.tipo = req.query.tipo;
            if (req.query.email) where.email = req.query.email;
            if (req.query.cpf) where.cpf = req.query.cpf;

            const usuarios = await Usuario.findAll({
                where,
                order: [['id', 'DESC']],
            });

            return res.json(usuarios.map(sanitize));
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async get(req, res) {
        try {
            const usuario = await Usuario.findByPk(req.params.id);
            if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

            return res.json(sanitize(usuario));
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const usuario = await Usuario.findByPk(req.params.id);
            if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

            const { senha, ...rest } = req.body;

            const dadosAtualizacao = { ...rest };

            if (senha) {
                dadosAtualizacao.senha = await bcrypt.hash(senha, 10);
            }

            await usuario.update(dadosAtualizacao);

            req.io?.emit('usuario:updated', {
                id: usuario.id,
                data: sanitize(usuario),
            });

            return res.json(sanitize(usuario));
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const usuario = await Usuario.findByPk(req.params.id);
            if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

            const id = usuario.id;
            await usuario.destroy();

            req.io?.emit('usuario:deleted', { id });

            return res.json({ ok: true });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },
};
