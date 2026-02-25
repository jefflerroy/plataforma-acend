const Evolucao = require('../models/Evolucao');
const Configuracoes = require('../models/Configuracoes');
const pdf = require('pdf-poppler');
const fs = require('fs');
const path = require('path');
const os = require('os');
const sharp = require('sharp');

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

async function pdfToPng(buffer, dpi = 450) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bio-'));
  const pdfPath = path.join(tempDir, 'file.pdf');

  fs.writeFileSync(pdfPath, buffer);

  await pdf.convert(pdfPath, {
    format: 'png',
    out_dir: tempDir,
    out_prefix: 'page',
    page: 1,
    scale: dpi
  });

  const pngPath = path.join(tempDir, 'page-1.png');
  const pngBuffer = fs.readFileSync(pngPath);

  fs.rmSync(tempDir, { recursive: true, force: true });

  return pngBuffer;
}

async function openaiJson(apiKey, payload) {
  const r = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  const data = await r.json();

  if (!r.ok) {
    throw new Error(data?.error?.message || 'Erro ao chamar OpenAI.');
  }

  const txt = getOutputText(data);

  try {
    return JSON.parse(txt);
  } catch {
    const s = txt.indexOf('{');
    const e = txt.lastIndexOf('}');
    if (s >= 0 && e > s) return JSON.parse(txt.slice(s, e + 1));
    throw new Error('Não foi possível interpretar o retorno em JSON.');
  }
}

async function localizarTabelas(apiKey, imageBase64) {
  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      musculo_gordura: {
        type: 'object',
        additionalProperties: false,
        properties: {
          x: { type: 'number' },
          y: { type: 'number' },
          w: { type: 'number' },
          h: { type: 'number' }
        },
        required: ['x', 'y', 'w', 'h']
      },
      obesidade: {
        type: 'object',
        additionalProperties: false,
        properties: {
          x: { type: 'number' },
          y: { type: 'number' },
          w: { type: 'number' },
          h: { type: 'number' }
        },
        required: ['x', 'y', 'w', 'h']
      }
    },
    required: ['musculo_gordura', 'obesidade']
  };

  const payload = {
    model: 'gpt-4o',
    temperature: 0,
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text:
              'Localize na imagem as tabelas com os títulos: "Análise Musculo-Gordura" e "Análise de Obesidade". ' +
              'Retorne bounding boxes em pixels no formato {x,y,w,h} para cada tabela. ' +
              'x,y = canto superior esquerdo. w,h = largura e altura. ' +
              'A caixa deve cobrir a tabela inteira (incluindo o título e todas as linhas).'
          },
          { type: 'input_image', image_url: `data:image/png;base64,${imageBase64}`, detail: 'high' }
        ]
      }
    ],
    text: {
      format: { type: 'json_schema', name: 'bboxes', strict: true, schema }
    }
  };

  return openaiJson(apiKey, payload);
}

async function recortarTabela(pngBuffer, box) {
  const meta = await sharp(pngBuffer).metadata();
  const x = Math.max(0, Math.min(Math.round(box.x), meta.width - 1));
  const y = Math.max(0, Math.min(Math.round(box.y), meta.height - 1));
  const w = Math.max(1, Math.min(Math.round(box.w), meta.width - x));
  const h = Math.max(1, Math.min(Math.round(box.h), meta.height - y));

  const cropped = await sharp(pngBuffer)
    .extract({ left: x, top: y, width: w, height: h })
    .png()
    .toBuffer();

  return cropped;
}

async function extrairCampos(apiKey, imgMGBase64, imgObBase64) {
  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      peso: { type: ['number', 'null'] },
      massa_muscular: { type: ['number', 'null'] },
      massa_gordura: { type: ['number', 'null'] },
      percentual_gordura: { type: ['number', 'null'] },
      imc: { type: ['number', 'null'] }
    },
    required: ['peso', 'massa_muscular', 'massa_gordura', 'percentual_gordura', 'imc']
  };

  const prompt =
    'Extraia do exame de bioimpedância APENAS estes campos: peso, massa_muscular, massa_gordura, percentual_gordura, imc. ' +
    'Use SOMENTE as imagens fornecidas (cada uma é um recorte de uma tabela). ' +
    'Na tabela "Análise Musculo-Gordura", extraia: Peso, Massa Muscular Esquelética, Massa de Gordura. ' +
    'Na tabela "Análise de Obesidade", extraia: IMC e PGC (Percentual de gordura). ' +
    'Ignore números de referência, faixas ideais, escalas, números abaixo das barras e números pequenos laterais. ' +
    'Não estime. Se não conseguir ler exatamente, retorne null. ' +
    'Normalize números para ponto decimal.';

  const payload = {
    model: 'gpt-4o',
    temperature: 0,
    input: [
      {
        role: 'user',
        content: [
          { type: 'input_text', text: prompt },
          { type: 'input_image', image_url: `data:image/png;base64,${imgMGBase64}`, detail: 'high' },
          { type: 'input_image', image_url: `data:image/png;base64,${imgObBase64}`, detail: 'high' }
        ]
      }
    ],
    text: {
      format: { type: 'json_schema', name: 'bioimpedancia', strict: true, schema }
    }
  };

  return openaiJson(apiKey, payload);
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
      if (!req.file?.buffer) {
        return res.status(400).json({ error: 'Envie um arquivo (file).' });
      }

      const config = await Configuracoes.findOne();
      const apiKey = config?.chatgpt_key;

      if (!apiKey) {
        return res.status(400).json({ error: 'chatgpt_key não configurada.' });
      }

      const mime = req.file.mimetype || '';
      let pagePng;

      if (mime === 'application/pdf') {
        pagePng = await pdfToPng(req.file.buffer, 450);
      } else if (mime.startsWith('image/')) {
        pagePng = await sharp(req.file.buffer).png().toBuffer();
      } else {
        return res.status(400).json({ error: 'Formato não suportado. Envie PDF ou imagem.' });
      }

      const pageBase64 = pagePng.toString('base64');

      const boxes = await localizarTabelas(apiKey, pageBase64);

      const mgCrop = await recortarTabela(pagePng, boxes.musculo_gordura);
      const obCrop = await recortarTabela(pagePng, boxes.obesidade);

      const result = await extrairCampos(apiKey, mgCrop.toString('base64'), obCrop.toString('base64'));

      return res.json(result);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
};