const { Post } = require('../models/Post');
const { PostCurtida } = require('../models/PostCurtida');
const { PostComentario } = require('../models/PostComentario');
const { Usuario } = require('../models/Usuario');

module.exports = {
    async create(req, res) {
        try {
            const post = await Post.create(req.body);

            const completo = await Post.findByPk(post.id, {
                include: [{ model: Usuario, as: 'usuario' }],
            });

            req.io?.emit('post:created', { id: post.id, data: completo });
            return res.json(completo);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async list(req, res) {
        try {
            const posts = await Post.findAll({
                include: [{ model: Usuario, as: 'usuario' }],
                order: [['created_at', 'DESC']],
            });
            return res.json(posts);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async get(req, res) {
        try {
            const post = await Post.findByPk(req.params.id, {
                include: [
                    { model: Usuario, as: 'usuario' },
                    {
                        model: PostComentario,
                        as: 'comentarios',
                        include: [{ model: Usuario, as: 'usuario' }],
                    },
                ],
            });

            if (!post) return res.status(404).json({ error: 'Post não encontrado' });
            return res.json(post);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const post = await Post.findByPk(req.params.id);
            if (!post) return res.status(404).json({ error: 'Post não encontrado' });

            await post.update(req.body);

            const completo = await Post.findByPk(post.id, {
                include: [{ model: Usuario, as: 'usuario' }],
            });

            req.io?.emit('post:updated', { id: post.id, data: completo });
            return res.json(completo);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const post = await Post.findByPk(req.params.id);
            if (!post) return res.status(404).json({ error: 'Post não encontrado' });

            const id = post.id;
            await post.destroy();

            req.io?.emit('post:deleted', { id });
            return res.json({ ok: true });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async like(req, res) {
        try {
            const { post_id, usuario_id } = req.body;

            await PostCurtida.create({ post_id, usuario_id });
            await Post.increment('total_curtidas', { by: 1, where: { id: post_id } });

            const post = await Post.findByPk(post_id, {
                attributes: ['id', 'total_curtidas', 'total_comentarios'],
            });

            req.io?.emit('post:liked', {
                post_id,
                usuario_id,
                total_curtidas: post?.total_curtidas ?? null,
            });

            return res.json({ ok: true, post });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async unlike(req, res) {
        try {
            const { post_id, usuario_id } = req.body;

            const deleted = await PostCurtida.destroy({ where: { post_id, usuario_id } });

            if (deleted) {
                await Post.decrement('total_curtidas', { by: 1, where: { id: post_id } });
            }

            const post = await Post.findByPk(post_id, {
                attributes: ['id', 'total_curtidas', 'total_comentarios'],
            });

            req.io?.emit('post:unliked', {
                post_id,
                usuario_id,
                total_curtidas: post?.total_curtidas ?? null,
            });

            return res.json({ ok: true, post });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async comment(req, res) {
        try {
            const { post_id, usuario_id, comentario } = req.body;

            const novo = await PostComentario.create({ post_id, usuario_id, comentario });
            await Post.increment('total_comentarios', { by: 1, where: { id: post_id } });

            const post = await Post.findByPk(post_id, {
                attributes: ['id', 'total_curtidas', 'total_comentarios'],
            });

            req.io?.emit('post:commented', {
                post_id,
                usuario_id,
                comentario: novo,
                total_comentarios: post?.total_comentarios ?? null,
            });

            return res.json({ ok: true, comentario: novo, post });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },
};
