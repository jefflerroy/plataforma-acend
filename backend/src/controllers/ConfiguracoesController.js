const Configuracoes = require('../models/Configuracoes');

function isAdmin(req) {
    return req.user?.tipo === 'admin';
}

module.exports = {

    async get(req, res) {
        try {
            const config = await Configuracoes.findOne();

            if (!config) {
                return res.status(404).json({ error: 'Configurações não encontradas.' });
            }

            return res.json(config);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async getPaciente(req, res) {
        try {
            const config = await Configuracoes.findOne({
                attributes: {
                    exclude: ['unico', 'chatpgt_key']
                }
            });

            if (!config) {
                return res.status(404).json({ error: 'Configurações não encontradas.' });
            }

            return res.json(config);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            if (!isAdmin(req)) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            let config = await Configuracoes.findOne();

            if (!config) {
                config = await Configuracoes.create({
                    unico: true,
                    ...req.body
                });
            } else {
                await config.update(req.body);
            }

            req.io?.emit('configuracoes:updated', config);

            return res.json(config);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },
};
