const BloqueioAgenda = require('../models/BloqueioAgenda');

function isAdmin(req) {
    return req.user?.tipo === 'admin';
}

module.exports = {

    async create(req, res) {
        try {
            if (!isAdmin(req)) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const bloqueio = await BloqueioAgenda.create(req.body);

            req.io?.emit('bloqueio:created', {
                id: bloqueio.id,
                data: bloqueio
            });

            return res.json(bloqueio);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async list(req, res) {
        try {
            const bloqueios = await BloqueioAgenda.findAll({
                order: [['data_inicio', 'ASC']]
            });

            return res.json(bloqueios);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async get(req, res) {
        try {
            const bloqueio = await BloqueioAgenda.findByPk(req.params.id);

            if (!bloqueio) {
                return res.status(404).json({ error: 'Bloqueio não encontrado.' });
            }

            return res.json(bloqueio);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            if (!isAdmin(req)) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const bloqueio = await BloqueioAgenda.findByPk(req.params.id);

            if (!bloqueio) {
                return res.status(404).json({ error: 'Bloqueio não encontrado.' });
            }

            await bloqueio.update(req.body);

            req.io?.emit('bloqueio:updated', {
                id: bloqueio.id,
                data: bloqueio
            });

            return res.json(bloqueio);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            if (!isAdmin(req)) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const bloqueio = await BloqueioAgenda.findByPk(req.params.id);

            if (!bloqueio) {
                return res.status(404).json({ error: 'Bloqueio não encontrado.' });
            }

            const id = bloqueio.id;

            await bloqueio.destroy();

            req.io?.emit('bloqueio:deleted', { id });

            return res.json({ ok: true });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },
};
