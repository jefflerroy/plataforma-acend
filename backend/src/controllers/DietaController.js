const { Op } = require("sequelize");
const sequelize = require("../database");
const Dieta = require("../models/Dieta");
const Refeicao = require("../models/Refeicao");
const Configuracoes = require("../models/Configuracoes");

function extractJson(text) {
    if (!text) return null;
    const t = String(text).trim();
    try {
        return JSON.parse(t);
    } catch { }
    const start = t.indexOf("{");
    const end = t.lastIndexOf("}");
    if (start >= 0 && end > start) {
        try {
            return JSON.parse(t.slice(start, end + 1));
        } catch { }
    }
    return null;
}

function keepNewlines(s) {
    if (s === null || s === undefined) return "";
    return String(s).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function normalizeHora(h) {
    const t = String(h || "").trim();
    const only = t.replace(/\D/g, "").slice(0, 4);
    if (only.length === 4) return `${only.slice(0, 2)}:${only.slice(2)}`;
    if (only.length === 3) return `${only.slice(0, 2)}:${only.slice(2)}`;
    return t;
}

function sanitizePayload(obj) {
    const titulo = String(obj?.titulo || "").trim();
    const observacao = keepNewlines(obj?.observacao || "");

    const refeicoes = Array.isArray(obj?.refeicoes) ? obj.refeicoes : [];
    const refeicoesSan = refeicoes
        .filter((r) => r && typeof r === "object")
        .map((r) => ({
            horario: normalizeHora(r.horario),
            refeicao: String(r.refeicao || "").trim(),
            descricao: keepNewlines(r.descricao || ""),
        }))
        .filter((r) => r.horario && r.refeicao);

    return { titulo, observacao, refeicoes: refeicoesSan };
}

async function uploadPdfToOpenAI({ apiKey, buffer, filename }) {
    const fd = new FormData();
    fd.append("purpose", "user_data");
    fd.append("file", new Blob([buffer], { type: "application/pdf" }), filename);

    const r = await fetch("https://api.openai.com/v1/files", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
        body: fd,
    });

    const data = await r.json().catch(() => null);
    if (!r.ok) {
        const msg = data?.error?.message || "Erro ao enviar arquivo para OpenAI.";
        throw new Error(msg);
    }

    if (!data?.id) throw new Error("Upload do PDF falhou: file_id não retornou.");
    return data.id;
}

async function openaiChatWithPdf({ apiKey, fileId, system, userText }) {
    const payload = {
        model: "gpt-5.2",
        messages: [
            { role: "system", content: system },
            {
                role: "user",
                content: [
                    { type: "file", file: { file_id: fileId } },
                    { type: "text", text: userText },
                ],
            },
        ],
        temperature: 0
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await r.json().catch(() => null);
    if (!r.ok) {
        const msg = data?.error?.message || "Erro ao chamar OpenAI.";
        throw new Error(msg);
    }

    return data?.choices?.[0]?.message?.content || "";
}

module.exports = {
    async parsePdf(req, res) {
        try {
            if (!req.file?.buffer) return res.status(400).json({ error: "Envie um arquivo PDF." });

            const config = await Configuracoes.findOne();
            if (!config?.chatgpt_key) return res.status(400).json({ error: "ChatGPT não configurado." });

            const system =
                "Responda SOMENTE com JSON válido. Não escreva mais nada.";

            const userText =
                "Extraia os dados do plano alimentar do PDF e devolva EXATAMENTE no formato:\n" +
                "{\n" +
                '  "titulo": "string",\n' +
                '  "observacao": "string",\n' +
                '  "refeicoes": [\n' +
                '    { "horario": "HH:MM", "refeicao": "string", "descricao": "string" }\n' +
                "  ]\n" +
                "}\n\n" +

                "Regras obrigatórias (simples):\n" +
                "1) Identifique refeições pelos horários do PDF (HH:MM). Cada refeição é um bloco: começa no horário e termina antes do próximo horário.\n" +
                "2) 'observacao' = tudo antes do primeiro horário.\n" +
                "3) 'descricao' deve conter TODO o texto do bloco daquela refeição (itens + Obs + Substituição), sem mover conteúdo para outras refeições.\n" +
                "4) Preserve quebras de linha e deixe o texto ORGANIZADO.\n\n" +

                "FORMATAÇÃO OBRIGATÓRIA dentro de 'descricao':\n" +
                "- Cada item de alimento com marcador (•) deve ficar em UMA LINHA separada. Se estiverem na mesma linha, quebre em múltiplas linhas.\n" +
                "- Após a lista de itens, mantenha 'Obs:' em uma nova linha (se existir).\n" +
                "- Antes de 'Substituição X', coloque UMA linha em branco.\n" +
                "- Após 'Substituição X', os itens da substituição também devem ficar um por linha (• ...).\n" +
                "- Se existir Obs da substituição, ela deve vir depois dos itens da substituição, em nova linha.\n" +
                "- Nunca coloque itens (•) depois de 'Obs:' se no PDF eles aparecem antes. Mantenha a ordem do PDF.\n\n" +

                "Exemplo de como deve ficar a descrição (modelo de layout):\n" +
                "• Item 1\n" +
                "• Item 2\n" +
                "Obs: texto...\n\n" +
                "Substituição 1\n" +
                "• Item A\n" +
                "• Item B\n" +
                "Obs: texto...\n\n" +

                "Se não conseguir identificar claramente a ordem original, use esta ordem padrão dentro da refeição:\n" +
                "(1) todos os bullets • iniciais, (2) Obs do bloco, (3) Substituição X, (4) bullets da substituição, (5) Obs da substituição.\n\n" +

                "Agora processe o PDF anexado.";

            const fileId = await uploadPdfToOpenAI({
                apiKey: config.chatgpt_key,
                buffer: req.file.buffer,
                filename: req.file.originalname || "plano.pdf",
            });

            const aiText = await openaiChatWithPdf({
                apiKey: config.chatgpt_key,
                fileId,
                system,
                userText
            });

            const json = extractJson(aiText);
            if (!json) return res.status(400).json({ error: "Não foi possível interpretar o PDF." });

            const payload = sanitizePayload(json);
            if (!payload.titulo) payload.titulo = "Plano alimentar";

            return res.json(payload);
        } catch (err) {
            return res.status(400).json({
                error: err.message || "Erro ao processar PDF.",
            });
        }
    },

    async create(req, res) {
        const t = await sequelize.transaction();
        try {
            const { titulo, observacao, refeicoes } = req.body;

            const dieta = await Dieta.create({ titulo, observacao }, { transaction: t });

            if (refeicoes && refeicoes.length > 0) {
                const refeicoesFormatadas = refeicoes.map((r) => ({
                    dieta_id: dieta.id,
                    horario: r.horario,
                    refeicao: r.refeicao,
                    descricao: r.descricao,
                }));

                await Refeicao.bulkCreate(refeicoesFormatadas, { transaction: t });
            }

            await t.commit();

            const dietaCompleta = await Dieta.findByPk(dieta.id, {
                include: [{ model: Refeicao, as: "refeicoes" }],
            });

            req.io?.emit("dieta:created", { id: dieta.id, data: dietaCompleta });

            return res.json(dietaCompleta);
        } catch (err) {
            await t.rollback();
            return res.status(400).json({ error: err.message });
        }
    },

    async list(req, res) {
        try {
            const { titulo } = req.query;
            const where = {};

            if (titulo) where.titulo = { [Op.like]: `%${titulo}%` };

            const dietas = await Dieta.findAll({
                where,
                include: [
                    {
                        model: Refeicao,
                        as: "refeicoes",
                        separate: true,
                        order: [["horario", "ASC"]],
                    }
                ],
                order: [["id", "DESC"]],
            });

            return res.json(dietas);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async get(req, res) {
        try {
            const dieta = await Dieta.findByPk(req.params.id, {
                include: [{ model: Refeicao, as: "refeicoes" }],
            });

            if (!dieta) return res.status(404).json({ error: "Dieta não encontrada" });

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
                return res.status(404).json({ error: "Dieta não encontrada" });
            }

            const { titulo, observacao, refeicoes } = req.body;

            await dieta.update({ titulo, observacao }, { transaction: t });

            if (refeicoes) {
                await Refeicao.destroy({ where: { dieta_id: dieta.id }, transaction: t });

                if (refeicoes.length > 0) {
                    const refeicoesFormatadas = refeicoes.map((r) => ({
                        dieta_id: dieta.id,
                        horario: r.horario,
                        refeicao: r.refeicao,
                        descricao: r.descricao,
                    }));

                    await Refeicao.bulkCreate(refeicoesFormatadas, { transaction: t });
                }
            }

            await t.commit();

            const dietaCompleta = await Dieta.findByPk(dieta.id, {
                include: [{ model: Refeicao, as: "refeicoes" }],
            });

            req.io?.emit("dieta:updated", { id: dieta.id, data: dietaCompleta });

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
                return res.status(404).json({ error: "Dieta não encontrada" });
            }

            await Refeicao.destroy({ where: { dieta_id: dieta.id }, transaction: t });

            const id = dieta.id;
            await dieta.destroy({ transaction: t });

            await t.commit();

            req.io?.emit("dieta:deleted", { id });

            return res.json({ ok: true });
        } catch (err) {
            await t.rollback();
            return res.status(400).json({ error: err.message });
        }
    },
};