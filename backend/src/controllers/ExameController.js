const Exame = require('../models/Exame');

module.exports = {
    async create(req, res) {
        try {
            const exame = await Exame.create(req.body);
            req.io?.emit('exame:created', { id: exame.id, data: exame });
            return res.json(exame);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async list(req, res) {
        try {
            const where = {};
            if (req.query.paciente_id) where.paciente_id = req.query.paciente_id;
            if (req.query.tipo) where.tipo = req.query.tipo;

            const exames = await Exame.findAll({
                where,
                order: [['id', 'DESC']],
            });

            return res.json(exames);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async get(req, res) {
        try {
            const exame = await Exame.findByPk(req.params.id);
            if (!exame) return res.status(404).json({ error: 'Exame não encontrado' });
            return res.json(exame);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const exame = await Exame.findByPk(req.params.id);
            if (!exame) return res.status(404).json({ error: 'Exame não encontrado' });

            await exame.update(req.body);
            req.io?.emit('exame:updated', { id: exame.id, data: exame });

            return res.json(exame);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const exame = await Exame.findByPk(req.params.id);
            if (!exame) return res.status(404).json({ error: 'Exame não encontrado' });

            const id = exame.id;
            await exame.destroy();
            req.io?.emit('exame:deleted', { id });

            return res.json({ ok: true });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },
};
