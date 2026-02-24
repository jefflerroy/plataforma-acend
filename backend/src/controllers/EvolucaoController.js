const Evolucao = require('../models/Evolucao');
const Configuracoes = require('../models/Configuracoes');

function isAdmin(req) {
  return req.user?.tipo === 'admin';
}

function isSelf(req, id) {
  return Number(req.user?.id) === Number(id);
}

function getOutputText(responseJson) {
  const out = responseJson?.output || [];
  let text = '';
  for (const item of out) {
    if (item?.type !== 'message') continue;
    const content = item?.content || [];
    for (const c of content) {
      if (c?.type === 'output_text' && typeof c?.text === 'string') text += c.text;
    }
  }
  return text.trim();
}

module.exports = {
  async create(req, res) {
    try {
      if (!isAdmin(req)) {
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

      const evolucao = await Evolucao.create({
        paciente_id,
        peso,
        massa_muscular,
        massa_gordura,
        percentual_gordura,
        imc,
      });

      req.io?.emit('evolucao:created', {
        id: evolucao.id,
        data: evolucao,
      });

      return res.json(evolucao);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async createPaciente(req, res) {
    try {
      const pacienteId = req.user?.id;

      if (!pacienteId) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
      }

      const {
        peso,
        massa_muscular,
        massa_gordura,
        percentual_gordura,
        imc,
      } = req.body;

      const evolucao = await Evolucao.create({
        paciente_id: pacienteId,
        peso,
        massa_muscular,
        massa_gordura,
        percentual_gordura,
        imc,
      });

      req.io?.emit('evolucao:created', {
        id: evolucao.id,
        data: evolucao,
      });

      return res.json(evolucao);
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
      if (req.query.paciente_id) where.paciente_id = req.query.paciente_id;

      const evolucoes = await Evolucao.findAll({
        where,
        order: [['id', 'DESC']],
      });

      return res.json(evolucoes);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async listPaciente(req, res) {
    try {
      const pacienteId = req.user?.id;

      if (!pacienteId) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
      }

      const evolucoes = await Evolucao.findAll({
        where: { paciente_id: pacienteId },
        order: [['id', 'DESC']],
      });

      return res.json(evolucoes);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async get(req, res) {
    try {
      const evolucao = await Evolucao.findByPk(req.params.id);
      if (!evolucao) return res.status(404).json({ error: 'Evolução não encontrada' });

      if (!isAdmin(req) && !isSelf(req, evolucao.paciente_id)) {
        return res.status(403).json({ error: 'Acesso negado.' });
      }

      return res.json(evolucao);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const evolucao = await Evolucao.findByPk(req.params.id);
      if (!evolucao) {
        return res.status(404).json({ error: 'Evolução não encontrada' });
      }

      if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Acesso negado.' });
      }

      const { paciente_id, ...rest } = req.body;

      const dadosAtualizacao = { ...rest };

      if (paciente_id) {
        dadosAtualizacao.paciente_id = paciente_id;
      }

      await evolucao.update(dadosAtualizacao);

      req.io?.emit('evolucao:updated', {
        id: evolucao.id,
        data: evolucao,
      });

      return res.json(evolucao);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async delete(req, res) {
    try {
      const evolucao = await Evolucao.findByPk(req.params.id);
      if (!evolucao) return res.status(404).json({ error: 'Evolução não encontrada' });

      if (!isAdmin(req)) {
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

  async extrairBioimpedancia(req, res) {
    try {
      console.log(req.headers['content-type']);
      if (!req.file?.buffer) {
        return res.status(400).json({ error: 'Envie um arquivo (file).' });
      }

      const config = await Configuracoes.findOne();
      const apiKey = config?.chatpgt_key;

      if (!apiKey) {
        return res.status(400).json({ error: 'chatpgt_key não configurada.' });
      }

      const mime = req.file.mimetype || 'application/octet-stream';
      const base64 = req.file.buffer.toString('base64');

      const content = [
        {
          type: 'input_text',
          text:
            'Extraia do exame de bioimpedância APENAS estes campos e retorne exatamente no JSON do schema: ' +
            'peso, massa_muscular, massa_gordura, percentual_gordura, imc. ' +
            'Se algum não existir, retorne null. Normalize números para ponto decimal.',
        },
      ];

      if (mime.startsWith('image/')) {
        content.push({
          type: 'input_image',
          image_url: `data:${mime};base64,${base64}`,
          detail: 'high',
        });
      } else {
        content.push({
          type: 'input_file',
          filename: req.file.originalname || 'bioimpedancia',
          file_data: `data:${mime};base64,${base64}`,
        });
      }

      const schema = {
        type: 'object',
        additionalProperties: false,
        properties: {
          peso: { type: ['number', 'null'] },
          massa_muscular: { type: ['number', 'null'] },
          massa_gordura: { type: ['number', 'null'] },
          percentual_gordura: { type: ['number', 'null'] },
          imc: { type: ['number', 'null'] },
        },
        required: ['peso', 'massa_muscular', 'massa_gordura', 'percentual_gordura', 'imc'],
      };

      const payload = {
        model: 'gpt-4o-mini',
        input: [{ role: 'user', content }],
        text: { format: { type: 'json_schema', name: 'bioimpedancia', strict: true, schema } },
      };

      const r = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await r.json();

      if (!r.ok) {
        return res.status(400).json({
          error: data?.error?.message || 'Erro ao processar bioimpedância.',
        });
      }

      const txt = getOutputText(data);

      let parsed;
      try {
        parsed = JSON.parse(txt);
      } catch {
        const s = txt.indexOf('{');
        const e = txt.lastIndexOf('}');
        if (s >= 0 && e > s) {
          parsed = JSON.parse(txt.slice(s, e + 1));
        } else {
          return res.status(400).json({ error: 'Não foi possível interpretar o retorno em JSON.' });
        }
      }

      return res.json(parsed);
    } catch (err) {
      console.log(err);
      
      return res.status(400).json({ error: err.message });
    }
  },
};