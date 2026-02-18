const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

function sanitize(usuario) {
    const data = usuario?.toJSON ? usuario.toJSON() : usuario;
    if (!data) return null;
    delete data.senha;
    return data;
}

function isAdmin(req) {
    return req.user?.tipo === 'admin';
}

function isSelf(req, id) {
    return Number(req.user?.id) === Number(id);
}

module.exports = {
    async create(req, res) {
        try {
            if (!isAdmin(req)) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const { senha, ...rest } = req.body;

            let senhaCriptografada = null;

            if (senha) {
                senhaCriptografada = await bcrypt.hash(senha, 10);
            }

            const usuario = await Usuario.create({
                ...rest,
                senha: senhaCriptografada,
            });

            req.io?.emit('usuario:created', {
                id: usuario.id,
                data: sanitize(usuario),
            });

            return res.json(sanitize(usuario));
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async createPaciente(req, res) {
        try {
            const { ...rest } = req.body;

            let senhaCriptografada = await bcrypt.hash('ascend', 10);

            const usuario = await Usuario.create({
                ...rest,
                senha: senhaCriptografada,
            });

            req.io?.emit('usuario:created', {
                id: usuario.id,
                data: sanitize(usuario),
            });

            return res.json(sanitize(usuario));
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async list(req, res) {
        try {
            if (!isAdmin(req)) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const where = {};
            if (req.query.tipo) where.tipo = req.query.tipo;
            if (req.query.email) where.email = req.query.email;
            if (req.query.cpf) where.cpf = req.query.cpf;

            const usuarios = await Usuario.findAll({
                where,
                order: [['id', 'DESC']],
            });

            return res.json(usuarios.map(sanitize));
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async listPacientes(req, res) {
        try {
            if (!isAdmin(req)) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const usuarios = await Usuario.findAll({
                where: {
                    tipo: 'paciente'
                },
                order: [['id', 'DESC']],
            });

            return res.json(usuarios.map(sanitize));
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async get(req, res) {
        try {
            const usuario = await Usuario.findByPk(req.params.id);
            if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

            if (!isAdmin(req) && !isSelf(req, usuario.id)) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            return res.json(sanitize(usuario));
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async me(req, res) {
        try {
            const usuarioId = req.user?.id;

            if (!usuarioId) {
                return res.status(401).json({ error: 'Usuário não autenticado.' });
            }

            const usuario = await Usuario.findByPk(usuarioId);

            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            return res.json(sanitize(usuario));
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },    

    async update(req, res) {
        try {
            const usuario = await Usuario.findByPk(req.params.id);
            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            if (!isAdmin(req) && !isSelf(req, usuario.id)) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const { senha, senhaAntiga, tipo, ...rest } = req.body;

            const dadosAtualizacao = { ...rest };

            if (tipo && isAdmin(req)) {
                dadosAtualizacao.tipo = tipo;
            }

            if (senha) {
                const usuarioLogado = req.user;

                const podeAlterarSemSenhaAntiga =
                    usuarioLogado.tipo === 'admin' ||
                    usuarioLogado.tipo === 'medico';

                if (!podeAlterarSemSenhaAntiga) {
                    if (!senhaAntiga) {
                        return res.status(400).json({
                            error: 'Informe a senha antiga para alterar a senha.'
                        });
                    }

                    const senhaCorreta = await bcrypt.compare(
                        senhaAntiga,
                        usuario.senha
                    );

                    if (!senhaCorreta) {
                        return res.status(400).json({
                            error: 'Senha antiga incorreta.'
                        });
                    }
                }

                dadosAtualizacao.senha = await bcrypt.hash(senha, 10);
            }

            await usuario.update(dadosAtualizacao);

            req.io?.emit('usuario:updated', {
                id: usuario.id,
                data: sanitize(usuario),
            });

            return res.json(sanitize(usuario));

        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const usuario = await Usuario.findByPk(req.params.id);
            if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

            if (!isAdmin(req)) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            if (isSelf(req, usuario.id)) {
                return res.status(400).json({ error: 'Você não pode deletar seu próprio usuário.' });
            }

            const id = usuario.id;
            await usuario.destroy();

            req.io?.emit('usuario:deleted', { id });

            return res.json({ ok: true });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },
};
