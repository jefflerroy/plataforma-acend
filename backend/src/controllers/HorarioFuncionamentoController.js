const HorarioFuncionamento = require('../models/HorarioFuncionamento');

function isAdmin(req) {
    return req.user?.tipo === 'admin';
}

module.exports = {

    async create(req, res) {
        try {
            if (!isAdmin(req)) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const { dia_semana } = req.body;

            const horarioExistente = await HorarioFuncionamento.findOne({
                where: { dia_semana }
            });

            let horario;

            if (horarioExistente) {
                await horarioExistente.update(req.body);
                horario = horarioExistente;

                req.io?.emit('horario:updated', {
                    id: horario.id,
                    data: horario
                });
            } else {
                horario = await HorarioFuncionamento.create(req.body);

                req.io?.emit('horario:created', {
                    id: horario.id,
                    data: horario
                });
            }

            return res.json(horario);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },    

    async list(req, res) {
        try {
            const horarios = await HorarioFuncionamento.findAll({
                order: [['dia_semana', 'ASC']]
            });

            return res.json(horarios);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async get(req, res) {
        try {
            const horario = await HorarioFuncionamento.findAll({
                where: {
                    usuario_id: req.params.id
                }
            });

            return res.json(horario || []);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            if (!isAdmin(req)) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const horario = await HorarioFuncionamento.findByPk(req.params.id);

            if (!horario) {
                return res.status(404).json({ error: 'Horário não encontrado.' });
            }

            await horario.update(req.body);

            req.io?.emit('horario:updated', {
                id: horario.id,
                data: horario
            });

            return res.json(horario);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            if (!isAdmin(req)) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const horario = await HorarioFuncionamento.findByPk(req.params.id);

            if (!horario) {
                return res.status(404).json({ error: 'Horário não encontrado.' });
            }

            const id = horario.id;

            await horario.destroy();

            req.io?.emit('horario:deleted', { id });

            return res.json({ ok: true });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },
};
