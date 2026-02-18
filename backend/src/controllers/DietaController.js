const { Op } = require("sequelize");
const sequelize = require('../database');
const Dieta = require('../models/Dieta');
const Refeicao = require('../models/Refeicao');

module.exports = {

    async create(req, res) {
        const t = await sequelize.transaction();

        try {
            const { titulo, observacao, refeicoes } = req.body;

            const dieta = await Dieta.create(
                { titulo, observacao },
                { transaction: t }
            );

            if (refeicoes && refeicoes.length > 0) {
                const refeicoesFormatadas = refeicoes.map(r => ({
                    ...r,
                    dieta_id: dieta.id
                }));

                await Refeicao.bulkCreate(refeicoesFormatadas, { transaction: t });
            }

            await t.commit();

            const dietaCompleta = await Dieta.findByPk(dieta.id, {
                include: [{ model: Refeicao, as: 'refeicoes' }]
            });

            req.io?.emit('dieta:created', { id: dieta.id, data: dietaCompleta });

            return res.json(dietaCompleta);

        } catch (err) {
            await t.rollback();
            console.log(err);
            return res.status(400).json({ error: err.message });
        }
    },

    async list(req, res) {
        try {
            const { titulo } = req.query;

            const where = {};

            if (titulo) {
                where.titulo = {
                    [Op.like]: `%${titulo}%`
                };
            }

            const dietas = await Dieta.findAll({
                where,
                include: [{ model: Refeicao, as: 'refeicoes' }],
                order: [['id', 'DESC']]
            });

            return res.json(dietas);

        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async get(req, res) {
        try {
            const dieta = await Dieta.findByPk(req.params.id, {
                include: [{ model: Refeicao, as: 'refeicoes' }]
            });

            if (!dieta) {
                return res.status(404).json({ error: 'Dieta não encontrada' });
            }

            return res.json(dieta);

        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async update(req, res) {
        const t = await sequelize.transaction();

        try {
            const dieta = await Dieta.findByPk(req.params.id);

            if (!dieta) {
                await t.rollback();
                return res.status(404).json({ error: 'Dieta não encontrada' });
            }

            const { titulo, observacao, refeicoes } = req.body;

            await dieta.update({ titulo, observacao }, { transaction: t });

            if (refeicoes) {
                await Refeicao.destroy({
                    where: { dieta_id: dieta.id },
                    transaction: t
                });

                if (refeicoes.length > 0) {
                    const refeicoesFormatadas = refeicoes.map(r => ({
                        ...r,
                        dieta_id: dieta.id
                    }));

                    await Refeicao.bulkCreate(refeicoesFormatadas, { transaction: t });
                }
            }

            await t.commit();

            const dietaCompleta = await Dieta.findByPk(dieta.id, {
                include: [{ model: Refeicao, as: 'refeicoes' }]
            });

            req.io?.emit('dieta:updated', { id: dieta.id, data: dietaCompleta });

            return res.json(dietaCompleta);

        } catch (err) {
            await t.rollback();
            return res.status(400).json({ error: err.message });
        }
    },

    async delete(req, res) {
        const t = await sequelize.transaction();

        try {
            const dieta = await Dieta.findByPk(req.params.id);

            if (!dieta) {
                await t.rollback();
                return res.status(404).json({ error: 'Dieta não encontrada' });
            }

            await Refeicao.destroy({
                where: { dieta_id: dieta.id },
                transaction: t
            });

            const id = dieta.id;

            await dieta.destroy({ transaction: t });

            await t.commit();

            req.io?.emit('dieta:deleted', { id });

            return res.json({ ok: true });

        } catch (err) {
            await t.rollback();
            return res.status(400).json({ error: err.message });
        }
    }

};
