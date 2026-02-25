const axios = require('axios');
const Chat = require('../models/Chat');
const Configuracoes = require('../models/Configuracoes');
const Usuario = require('../models/Usuario');
const DietaUsuario = require('../models/DietaUsuario');
const Dieta = require('../models/Dieta');
const Refeicao = require('../models/Refeicao');
const Evolucao = require('../models/Evolucao');
const Exame = require('../models/Exame');
const Agendamento = require('../models/Agendamento');

function isAdmin(req) {
  return req.user?.tipo === 'admin';
}

function isSelf(req, pacienteId) {
  return Number(req.user?.id) === Number(pacienteId);
}

function sanitizeUsuario(usuario) {
  const data = usuario?.toJSON ? usuario.toJSON() : usuario;
  if (!data) return null;
  delete data.senha;
  return data;
}

function extractJson(text) {
  if (!text) return null;
  const t = String(text).trim();
  try {
    return JSON.parse(t);
  } catch { }
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(t.slice(start, end + 1));
    } catch { }
  }
  return null;
}

async function openaiChat({ apiKey, messages, temperature = 0.7, max_tokens }) {
  const payload = {
    model: 'gpt-4o-mini',
    messages,
    temperature,
  };

  if (max_tokens) payload.max_tokens = max_tokens;

  const response = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data?.choices?.[0]?.message?.content || '';
}

module.exports = {
  async send(req, res) {
    try {
      const paciente_id = req.user?.id;
      const { mensagem } = req.body;

      if (!paciente_id) return res.status(401).json({ error: 'Usuário não autenticado.' });
      if (!mensagem) return res.status(400).json({ error: 'Mensagem é obrigatória.' });
      if (!isAdmin(req) && !isSelf(req, paciente_id)) return res.status(403).json({ error: 'Acesso negado.' });

      const config = await Configuracoes.findOne();
      if (!config?.chatgpt_key) return res.status(400).json({ error: 'ChatGPT não configurado.' });

      await Chat.create({
        paciente_id,
        mensagem,
        resposta_ia: false,
      });

      const historico = await Chat.findAll({
        where: { paciente_id },
        order: [['created_at', 'ASC']],
      });

      const systemBase =
        'Você é o Assistente da Ascend Nutrologia. Responda em português de forma simples, direta e objetiva. Não utilize tabelas, não faça listas complexas e evite textos longos. Apenas texto simples, como em um chat comum.';

      const baseMessages = [
        { role: 'system', content: systemBase },
        ...historico.map((msg) => ({
          role: msg.resposta_ia ? 'assistant' : 'user',
          content: msg.mensagem,
        })),
      ];

      const gateMessages = [
        {
          role: 'system',
          content: 'Responda SOMENTE com JSON válido. Não escreva mais nada.',
        },
        {
          role: 'user',
          content:
            `Mensagem do paciente: ${mensagem}\n\n` +
            'Você precisa de dados do próprio paciente (perfil, dieta, refeições, exames, evoluções, agendamentos) para responder bem?\n' +
            'Responda no formato exato:\n' +
            '{"needs_user_data": true|false}',
        },
      ];

      const gateText = await openaiChat({
        apiKey: config.chatgpt_key,
        messages: gateMessages,
        temperature: 0,
        max_tokens: 60,
      });

      const gate = extractJson(gateText) || { needs_user_data: false };

      let respostaTexto = '';

      if (gate.needs_user_data) {
        const usuario = await Usuario.findByPk(paciente_id, {
          include: [
            {
              model: DietaUsuario,
              as: 'dietasUsuarios',
              separate: true,
              order: [['id', 'DESC']],
              include: [
                {
                  model: Dieta,
                  as: 'dieta',
                  include: [
                    {
                      model: Refeicao,
                      as: 'refeicoes',
                      separate: true,
                      order: [['horario', 'ASC']],
                    },
                  ],
                },
              ],
            },
            { model: Evolucao, as: 'evolucoes', separate: true, order: [['id', 'DESC']] },
            { model: Exame, as: 'exames', separate: true, order: [['id', 'DESC']] },
            { model: Agendamento, as: 'agendamentosPaciente', separate: true, order: [['id', 'DESC']] },
          ],
        });

        const dadosPaciente = sanitizeUsuario(usuario) || {};

        const messagesComDados = [
          { role: 'system', content: systemBase },
          {
            role: 'system',
            content:
              'Dados do paciente em JSON para você usar como contexto. Use apenas o que for necessário para responder. Não exponha dados sensíveis sem necessidade.',
          },
          { role: 'system', content: JSON.stringify(dadosPaciente) },
          ...historico.map((msg) => ({
            role: msg.resposta_ia ? 'assistant' : 'user',
            content: msg.mensagem,
          })),
        ];

        respostaTexto = await openaiChat({
          apiKey: config.chatgpt_key,
          messages: messagesComDados,
          temperature: 0.7,
        });
      } else {
        respostaTexto = await openaiChat({
          apiKey: config.chatgpt_key,
          messages: baseMessages,
          temperature: 0.7,
        });
      }

      const respostaSalva = await Chat.create({
        paciente_id,
        mensagem: respostaTexto,
        resposta_ia: true,
      });

      req.io?.emit('chat:new_message', {
        paciente_id,
        mensagem: respostaSalva,
      });

      return res.json({
        pergunta: mensagem,
        resposta: respostaTexto,
      });
    } catch (err) {
      return res.status(400).json({
        error: err.response?.data?.error?.message || err.message || 'Erro ao processar mensagem.',
      });
    }
  },

  async list(req, res) {
    try {
      const paciente_id = req.user?.id;

      if (!paciente_id) return res.status(401).json({ error: 'Usuário não autenticado.' });
      if (!isAdmin(req) && !isSelf(req, paciente_id)) return res.status(403).json({ error: 'Acesso negado.' });

      const mensagens = await Chat.findAll({
        where: { paciente_id },
        order: [['created_at', 'DESC']],
      });

      return res.json(mensagens);
    } catch (err) {
      return res.status(400).json({
        error: err.message || 'Erro ao listar mensagens.',
      });
    }
  },
};