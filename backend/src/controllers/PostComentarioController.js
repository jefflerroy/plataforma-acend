const { PostComentario } = require('../models/PostComentario');

module.exports = {
    async create(req, res) {
        try {
            const comentario = await PostComentario.create(req.body);
            req.io?.emit('post_comentario:created', { id: comentario.id, data: comentario });
            return res.json(comentario);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async list(req, res) {
        try {
            const where = {};
            if (req.query.post_id) where.post_id = req.query.post_id;
            if (req.query.usuario_id) where.usuario_id = req.query.usuario_id;

            const comentarios = await PostComentario.findAll({ where, order: [['id', 'DESC']] });
            return res.json(comentarios);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async get(req, res) {
        try {
            const comentario = await PostComentario.findByPk(req.params.id);
            if (!comentario) return res.status(404).json({ error: 'Comentário não encontrado' });
            return res.json(comentario);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const comentario = await PostComentario.findByPk(req.params.id);
            if (!comentario) return res.status(404).json({ error: 'Comentário não encontrado' });

            await comentario.update(req.body);
            req.io?.emit('post_comentario:updated', { id: comentario.id, data: comentario });

            return res.json(comentario);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const comentario = await PostComentario.findByPk(req.params.id);
            if (!comentario) return res.status(404).json({ error: 'Comentário não encontrado' });

            const id = comentario.id;
            await comentario.destroy();
            req.io?.emit('post_comentario:deleted', { id });

            return res.json({ ok: true });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },
};
