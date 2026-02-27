const Exame = require('../models/Exame');
const Usuario = require('../models/Usuario');
const path = require('path');

function sanitize(exame) {
    const data = exame?.toJSON ? exame.toJSON() : exame;
    if (!data) return null;
    return data;
}

function isAdmin(req) {
    return req.user?.tipo === 'admin';
}

function isMedico(req) {
    return req.user?.tipo === 'medico';
}

function isSelf(req, id) {
    return Number(req.user?.id) === Number(id);
}

module.exports = {
    async arquivo(req, res) {
        try {
            const exame = await Exame.findByPk(req.params.id);
            if (!exame) return res.status(404).json({ error: 'Exame não encontrado' });

            if (!isAdmin(req) && !isMedico(req) && !isSelf(req, exame.paciente_id)) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            if (!exame.url) {
                return res.status(404).json({ error: 'Arquivo não encontrado.' });
            }

            const relative = exame.url.replace(/^\/+/, '');
            const filePath = path.resolve(process.cwd(), relative);

            return res.sendFile(filePath, {
                headers: {
                    'Content-Type': exame.mime || 'application/octet-stream',
                    'Content-Disposition': `inline; filename="${exame.nome_original || 'arquivo'}"`,
                },
            });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async create(req, res) {
        try {
            const { tipo } = req.body;
            const file = req.file;
            const paciente_id = req.user?.id;

            const exame = await Exame.create({
                paciente_id,
                tipo,
                nome_original: file ? file.originalname : req.body.nome_original,
                url: file ? `/uploads/exames/${file.filename}` : (req.body.url || null),
                mime: file ? file.mimetype : (req.body.mime || null),
            });

            req.io?.emit('exame:created', { id: exame.id, data: sanitize(exame) });

            return res.json(sanitize(exame));
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
                include: [{ model: Usuario, as: 'paciente', attributes: ['id', 'nome', 'email', 'tipo'] }],
                order: [['id', 'DESC']],
            });

            return res.json(exames.map(sanitize));
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async meusExames(req, res) {
        try {
            const paciente_id = req.user?.id;

            const exames = await Exame.findAll({
                where: { paciente_id },
                include: [{ model: Usuario, as: 'paciente', attributes: ['id', 'nome', 'email', 'tipo'] }],
                order: [['id', 'DESC']],
            });

            return res.json(exames.map(sanitize));
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async get(req, res) {
        try {
            const exame = await Exame.findByPk(req.params.id, {
                include: [{ model: Usuario, as: 'paciente', attributes: ['id', 'nome', 'email', 'tipo'] }],
            });

            if (!exame) return res.status(404).json({ error: 'Exame não encontrado' });

            return res.json(sanitize(exame));
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const exame = await Exame.findByPk(req.params.id);
            if (!exame) return res.status(404).json({ error: 'Exame não encontrado' });

            const { paciente_id, url, nome_original, mime, ...rest } = req.body;
            const file = req.file;

            const dadosAtualizacao = { ...rest };

            if (paciente_id) dadosAtualizacao.paciente_id = paciente_id;

            if (file) {
                dadosAtualizacao.url = `/uploads/exames/${file.filename}`;
                dadosAtualizacao.nome_original = file.originalname;
                dadosAtualizacao.mime = file.mimetype;
            } else {
                if (url !== undefined) dadosAtualizacao.url = url;
                if (nome_original !== undefined) dadosAtualizacao.nome_original = nome_original;
                if (mime !== undefined) dadosAtualizacao.mime = mime;
            }

            await exame.update(dadosAtualizacao);

            req.io?.emit('exame:updated', { id: exame.id, data: sanitize(exame) });

            return res.json(sanitize(exame));
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