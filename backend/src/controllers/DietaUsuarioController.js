const { DietaUsuario } = require('../models/DietaUsuario');
const { Dieta } = require('../models/Dieta')
const { Usuario } = require('../models/Usuario')

module.exports = {
    async create(req, res) {
        try {
            const vinculo = await DietaUsuario.create(req.body);
            req.io?.emit('dieta_usuario:created', { id: vinculo.id, data: vinculo });
            return res.json(vinculo);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async list(req, res) {
        try {
            const where = {};
            if (req.query.paciente_id) where.paciente_id = req.query.paciente_id;
            if (req.query.dieta_id) where.dieta_id = req.query.dieta_id;

            const vinculos = await DietaUsuario.findAll({
                where,
                include: [
                    { model: Usuario, as: 'paciente' },
                    { model: Dieta, as: 'dieta' },
                ],
                order: [['id', 'DESC']],
            });

            return res.json(vinculos);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async get(req, res) {
        try {
            const vinculo = await DietaUsuario.findByPk(req.params.id, {
                include: [
                    { model: Usuario, as: 'paciente' },
                    { model: Dieta, as: 'dieta' },
                ],
            });

            if (!vinculo) return res.status(404).json({ error: 'Vínculo não encontrado' });
            return res.json(vinculo);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const vinculo = await DietaUsuario.findByPk(req.params.id);
            if (!vinculo) return res.status(404).json({ error: 'Vínculo não encontrado' });

            await vinculo.update(req.body);
            req.io?.emit('dieta_usuario:updated', { id: vinculo.id, data: vinculo });

            return res.json(vinculo);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const vinculo = await DietaUsuario.findByPk(req.params.id);
            if (!vinculo) return res.status(404).json({ error: 'Vínculo não encontrado' });

            const id = vinculo.id;
            await vinculo.destroy();
            req.io?.emit('dieta_usuario:deleted', { id });

            return res.json({ ok: true });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },
};
