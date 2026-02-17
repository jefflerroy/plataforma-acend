const Refeicao = require('../models/Refeicao');

module.exports = {
    async create(req, res) {
        try {
            const refeicao = await Refeicao.create(req.body);
            req.io?.emit('refeicao:created', { id: refeicao.id, data: refeicao });
            return res.json(refeicao);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async list(req, res) {
        try {
            const where = {};
            if (req.query.dieta_id) where.dieta_id = req.query.dieta_id;

            const refeicoes = await Refeicao.findAll({
                where,
                order: [['horario', 'ASC']],
            });

            return res.json(refeicoes);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async get(req, res) {
        try {
            const refeicao = await Refeicao.findByPk(req.params.id);
            if (!refeicao) return res.status(404).json({ error: 'Refeição não encontrada' });
            return res.json(refeicao);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const refeicao = await Refeicao.findByPk(req.params.id);
            if (!refeicao) return res.status(404).json({ error: 'Refeição não encontrada' });

            await refeicao.update(req.body);
            req.io?.emit('refeicao:updated', { id: refeicao.id, data: refeicao });

            return res.json(refeicao);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const refeicao = await Refeicao.findByPk(req.params.id);
            if (!refeicao) return res.status(404).json({ error: 'Refeição não encontrada' });

            const id = refeicao.id;
            await refeicao.destroy();
            req.io?.emit('refeicao:deleted', { id });

            return res.json({ ok: true });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },
};
