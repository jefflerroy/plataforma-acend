const Evolucao = require('../models/Evolucao');
const Usuario = require('../models/Usuario');
const path = require('path');

function sanitize(evolucao) {
  const data = evolucao?.toJSON ? evolucao.toJSON() : evolucao;
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

function toDecimal(v) {
  if (v === null || v === undefined || v === "") return null;
  return String(v).trim().replace(/\./g, "").replace(",", ".");
}

module.exports = {
  async pdf(req, res) {
    try {
      const evolucao = await Evolucao.findByPk(req.params.id);
      if (!evolucao) return res.status(404).json({ error: 'Evolução não encontrada' });

      if (!isAdmin(req) && !isMedico(req) && !isSelf(req, evolucao.paciente_id)) {
        return res.status(403).json({ error: 'Acesso negado.' });
      }

      if (!evolucao.bioimpedancia_url) {
        return res.status(404).json({ error: 'PDF não encontrado.' });
      }

      const relative = evolucao.bioimpedancia_url.replace(/^\/+/, '');
      const filePath = path.resolve(process.cwd(), relative);

      return res.sendFile(filePath, {
        headers: {
          'Content-Type': evolucao.bioimpedancia_mime || 'application/pdf',
          'Content-Disposition': `inline; filename="${evolucao.bioimpedancia_nome || 'bioimpedancia.pdf'}"`,
        },
      });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      if (!isAdmin(req) && !isMedico(req)) {
        return res.status(403).json({ error: 'Acesso negado.' });
      }

      const {
        paciente_id,
        peso,
        massa_muscular,
        massa_gordura,
        percentual_gordura,
        imc,
      } = req.body;

      const file = req.file;

      const evolucao = await Evolucao.create({
        paciente_id,
        peso: toDecimal(peso),
        massa_muscular: toDecimal(massa_muscular),
        massa_gordura: toDecimal(massa_gordura),
        percentual_gordura: toDecimal(percentual_gordura),
        imc: toDecimal(imc),
        bioimpedancia_url: file ? `/uploads/bioimpedancia/${file.filename}` : null,
        bioimpedancia_nome: file ? file.originalname : null,
        bioimpedancia_mime: file ? file.mimetype : null,
      });

      req.io?.emit('evolucao:created', { id: evolucao.id, data: sanitize(evolucao) });

      return res.json(sanitize(evolucao));
    } catch (err) {
      console.log(err);
      return res.status(400).json({ error: err.message });
    }
  },

  async list(req, res) {
    try {
      if (!isAdmin(req) && !isMedico(req)) {
        return res.status(403).json({ error: 'Acesso negado.' });
      }

      const where = {};
      if (req.query.paciente_id) where.paciente_id = req.query.paciente_id;

      const evolucoes = await Evolucao.findAll({
        where,
        include: [{ model: Usuario, as: 'paciente', attributes: ['id', 'nome', 'email', 'tipo'] }],
        order: [['id', 'DESC']],
      });

      return res.json(evolucoes.map(sanitize));
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async minhasEvolucoes(req, res) {
    try {
      const paciente_id = req.user.id;

      const where = {};
      if (paciente_id) where.paciente_id = paciente_id;

      const evolucoes = await Evolucao.findAll({
        where,
        include: [{ model: Usuario, as: 'paciente', attributes: ['id', 'nome', 'email', 'tipo'] }],
        order: [['id', 'DESC']],
      });

      return res.json(evolucoes.map(sanitize));
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async get(req, res) {
    try {
      const evolucao = await Evolucao.findByPk(req.params.id, {
        include: [{ model: Usuario, as: 'paciente', attributes: ['id', 'nome', 'email', 'tipo'] }],
      });

      if (!evolucao) return res.status(404).json({ error: 'Evolução não encontrada' });

      if (!isAdmin(req) && !isMedico(req) && !isSelf(req, evolucao.paciente_id)) {
        return res.status(403).json({ error: 'Acesso negado.' });
      }

      return res.json(sanitize(evolucao));
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const evolucao = await Evolucao.findByPk(req.params.id);
      if (!evolucao) return res.status(404).json({ error: 'Evolução não encontrada' });

      if (!isAdmin(req) && !isMedico(req)) {
        return res.status(403).json({ error: 'Acesso negado.' });
      }

      const {
        paciente_id,
        bioimpedancia_url,
        bioimpedancia_nome,
        bioimpedancia_mime,
        ...rest
      } = req.body;

      const file = req.file;

      const dadosAtualizacao = { ...rest };

      if (paciente_id) dadosAtualizacao.paciente_id = paciente_id;

      if (file) {
        dadosAtualizacao.bioimpedancia_url = `/uploads/bioimpedancia/${file.filename}`;
        dadosAtualizacao.bioimpedancia_nome = file.originalname;
        dadosAtualizacao.bioimpedancia_mime = file.mimetype;
      } else {
        if (bioimpedancia_url !== undefined) dadosAtualizacao.bioimpedancia_url = bioimpedancia_url;
        if (bioimpedancia_nome !== undefined) dadosAtualizacao.bioimpedancia_nome = bioimpedancia_nome;
        if (bioimpedancia_mime !== undefined) dadosAtualizacao.bioimpedancia_mime = bioimpedancia_mime;
      }

      await evolucao.update(dadosAtualizacao);

      req.io?.emit('evolucao:updated', { id: evolucao.id, data: sanitize(evolucao) });

      return res.json(sanitize(evolucao));
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async delete(req, res) {
    try {
      const evolucao = await Evolucao.findByPk(req.params.id);
      if (!evolucao) return res.status(404).json({ error: 'Evolução não encontrada' });

      if (!isAdmin(req) && !isMedico(req)) {
        return res.status(403).json({ error: 'Acesso negado.' });
      }

      const id = evolucao.id;
      await evolucao.destroy();

      req.io?.emit('evolucao:deleted', { id });

      return res.json({ ok: true });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },
};