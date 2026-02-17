
const Agendamento = require('../models/Agendamento');
const Usuario = require('../models/Usuario');

module.exports = {
    async create(req, res) {
        try {
            const agendamento = await Agendamento.create(req.body);
            req.io?.emit('agendamento:created', { id: agendamento.id, data: agendamento });
            return res.json(agendamento);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async list(req, res) {
        try {
            const where = {};
            if (req.query.paciente_id) where.paciente_id = req.query.paciente_id;
            if (req.query.profissional_id) where.profissional_id = req.query.profissional_id;
            if (req.query.status) where.status = req.query.status;
            if (req.query.tipo) where.tipo = req.query.tipo;
            if (req.query.data) where.data = req.query.data;

            const agendamentos = await Agendamento.findAll({
                where,
                include: [
                    { model: Usuario, as: 'paciente' },
                    { model: Usuario, as: 'profissional' },
                ],
                order: [['data', 'ASC'], ['hora', 'ASC']],
            });

            return res.json(agendamentos);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async get(req, res) {
        try {
            const agendamento = await Agendamento.findByPk(req.params.id, {
                include: [
                    { model: Usuario, as: 'paciente' },
                    { model: Usuario, as: 'profissional' },
                ],
            });

            if (!agendamento) return res.status(404).json({ error: 'Agendamento não encontrado' });
            return res.json(agendamento);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const agendamento = await Agendamento.findByPk(req.params.id);
            if (!agendamento) return res.status(404).json({ error: 'Agendamento não encontrado' });

            await agendamento.update(req.body);
            req.io?.emit('agendamento:updated', { id: agendamento.id, data: agendamento });

            return res.json(agendamento);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const agendamento = await Agendamento.findByPk(req.params.id);
            if (!agendamento) return res.status(404).json({ error: 'Agendamento não encontrado' });

            const id = agendamento.id;
            await agendamento.destroy();
            req.io?.emit('agendamento:deleted', { id });

            return res.json({ ok: true });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },
};
