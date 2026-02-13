const { PostCurtida } = require('../models/PostCurtida');

module.exports = {
    async create(req, res) {
        try {
            const curtida = await PostCurtida.create(req.body);
            req.io?.emit('post_curtida:created', { id: curtida.id, data: curtida });
            return res.json(curtida);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async list(req, res) {
        try {
            const where = {};
            if (req.query.post_id) where.post_id = req.query.post_id;
            if (req.query.usuario_id) where.usuario_id = req.query.usuario_id;

            const curtidas = await PostCurtida.findAll({ where, order: [['id', 'DESC']] });
            return res.json(curtidas);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async get(req, res) {
        try {
            const curtida = await PostCurtida.findByPk(req.params.id);
            if (!curtida) return res.status(404).json({ error: 'Curtida não encontrada' });
            return res.json(curtida);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const curtida = await PostCurtida.findByPk(req.params.id);
            if (!curtida) return res.status(404).json({ error: 'Curtida não encontrada' });

            await curtida.update(req.body);
            req.io?.emit('post_curtida:updated', { id: curtida.id, data: curtida });

            return res.json(curtida);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const curtida = await PostCurtida.findByPk(req.params.id);
            if (!curtida) return res.status(404).json({ error: 'Curtida não encontrada' });

            const id = curtida.id;
            await curtida.destroy();
            req.io?.emit('post_curtida:deleted', { id });

            return res.json({ ok: true });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },
};
