const { Op } = require('sequelize');
const Post = require('../models/Post');
const PostCurtida = require('../models/PostCurtida');
const PostComentario = require('../models/PostComentario');
const Usuario = require('../models/Usuario');

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
            const usuarioLogadoId = req.user.id;

            const posts = await Post.findAll({
                include: [
                    { model: Usuario, as: 'usuario' },
                    {
                        model: PostCurtida,
                        as: 'curtidas',
                        attributes: ['usuario_id'],
                    }
                ],
                order: [['createdAt', 'DESC']],
            });

            const postsComCurtido = posts.map(post => {
                const curtido = post.curtidas.some(c => c.usuario_id === usuarioLogadoId);
                return { ...post.toJSON(), curtido };
            });

            return res.json(postsComCurtido);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async totalHoje(req, res) {
        try {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            const amanha = new Date(hoje);
            amanha.setDate(hoje.getDate() + 1);

            const total = await Post.count({
                where: {
                    created_at: {
                        [Op.gte]: hoje,
                        [Op.lt]: amanha,
                    },
                },
            });

            return res.json({ total });
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
                order: [[{ model: PostComentario, as: 'comentarios' }, 'id', 'DESC']],
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

            const usuarioId = req.user.id;
            const isAdmin = req.user.tipo === 'admin';

            if (!isAdmin && post.usuario_id !== usuarioId) {
                return res.status(403).json({ error: 'Sem permissão' });
            }

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

            const completo = await PostComentario.findByPk(novo.id, {
                include: [{ model: Usuario, as: 'usuario' }],
            });

            const post = await Post.findByPk(post_id, {
                attributes: ['id', 'total_curtidas', 'total_comentarios'],
            });

            req.io?.emit('post_comentario:created', { id: completo.id, data: completo });
            req.io?.emit('post:commented', {
                post_id,
                usuario_id,
                comentario: completo,
                total_comentarios: post?.total_comentarios ?? null,
            });

            return res.json({ ok: true, comentario: completo, post });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async deleteComment(req, res) {
        try {
            const comentario = await PostComentario.findByPk(req.params.id);
            if (!comentario) return res.status(404).json({ error: 'Comentário não encontrado' });

            const usuarioId = req.user.id;
            const isAdmin = req.user.tipo === 'admin';

            if (!isAdmin && comentario.usuario_id !== usuarioId) {
                return res.status(403).json({ error: 'Sem permissão' });
            }

            const postId = comentario.post_id;
            const id = comentario.id;

            await comentario.destroy();
            await Post.decrement('total_comentarios', { by: 1, where: { id: postId } });

            const post = await Post.findByPk(postId, {
                attributes: ['id', 'total_comentarios'],
            });

            req.io?.emit('post_comentario:deleted', { id, post_id: postId });
            req.io?.emit('post:commentDeleted', {
                post_id: postId,
                total_comentarios: post?.total_comentarios ?? null,
                comentario_id: id,
            });

            return res.json({ ok: true });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },
};