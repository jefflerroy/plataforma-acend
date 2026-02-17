const Dieta = require('../models/Dieta')
const Refeicao = require('../models/Refeicao')

module.exports = {
    async create(req, res) {
        try {
            const dieta = await Dieta.create(req.body);
            req.io?.emit('dieta:created', { id: dieta.id, data: dieta });
            return res.json(dieta);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async list(req, res) {
        try {
            const dietas = await Dieta.findAll({ order: [['id', 'DESC']] });
            return res.json(dietas);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async get(req, res) {
        try {
            const dieta = await Dieta.findByPk(req.params.id, {
                include: [{ model: Refeicao, as: 'refeicoes' }],
            });
            if (!dieta) return res.status(404).json({ error: 'Dieta não encontrada' });
            return res.json(dieta);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const dieta = await Dieta.findByPk(req.params.id);
            if (!dieta) return res.status(404).json({ error: 'Dieta não encontrada' });

            await dieta.update(req.body);
            req.io?.emit('dieta:updated', { id: dieta.id, data: dieta });

            return res.json(dieta);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const dieta = await Dieta.findByPk(req.params.id);
            if (!dieta) return res.status(404).json({ error: 'Dieta não encontrada' });

            const id = dieta.id;
            await dieta.destroy();
            req.io?.emit('dieta:deleted', { id });

            return res.json({ ok: true });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },
};
