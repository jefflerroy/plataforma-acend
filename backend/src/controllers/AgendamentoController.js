const { Op } = require('sequelize');
const Agendamento = require('../models/Agendamento');
const Usuario = require('../models/Usuario');
const HorarioFuncionamento = require('../models/HorarioFuncionamento');
const BloqueioAgenda = require('../models/BloqueioAgenda');
const Configuracoes = require('../models/Configuracoes');
const connection = require("../database");

function gerarIntervalos(inicio, fim, duracao) {
    const horarios = [];
    let atual = new Date(`2000-01-01T${inicio}`);
    const limite = new Date(`2000-01-01T${fim}`);

    while (atual < limite) {
        horarios.push(atual.toTimeString().slice(0, 5));
        atual.setMinutes(atual.getMinutes() + duracao);
    }

    return horarios;
}

function toHHmm(v) {
    if (!v) return null;

    const s = String(v);

    if (s.includes("T")) {
        const d = new Date(s);
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        return `${hh}:${mm}`;
    }

    const parts = s.split(":");
    const hh = String(Number(parts[0] ?? 0)).padStart(2, "0");
    const mm = String(Number(parts[1] ?? 0)).padStart(2, "0");
    return `${hh}:${mm}`;
}

module.exports = {

    async atualizarAgendamentosConcluidos() {
        await connection.query(`
          UPDATE "agendamento"
          SET status = 'Concluído'
          WHERE status = 'Agendado'
          AND (data::timestamp + hora::time) < NOW()
        `);
    },

    async proximaConsultaPaciente(req, res) {
        try {
            const { paciente_id } = req.query;

            if (!paciente_id) {
                return res.status(400).json({ error: "paciente_id é obrigatório" });
            }

            const agora = new Date();

            const proxima = await Agendamento.findOne({
                where: {
                    paciente_id,
                    status: 'Agendado',
                    [Op.or]: [
                        { data: { [Op.gt]: agora.toISOString().split('T')[0] } },
                        {
                            data: agora.toISOString().split('T')[0],
                            hora: { [Op.gt]: agora.toTimeString().slice(0, 5) }
                        }
                    ]
                },
                include: [
                    { model: Usuario, as: 'profissional' }
                ],
                order: [['data', 'ASC'], ['hora', 'ASC']]
            });

            return res.json(proxima);

        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async disponiveis(req, res) {
        try {
            const { profissional_id, data } = req.query;

            const config = await Configuracoes.findOne();

            if (config?.bloquear_agendamentos) {
                const limite = new Date(config.bloquear_agendamentos);
                if (new Date(data) <= limite) {
                    return res.json([]);
                }
            }

            const diaSemana = new Date(data).getDay();

            const horario = await HorarioFuncionamento.findOne({
                where: {
                    usuario_id: profissional_id,
                    dia_semana: diaSemana + 1,
                    ativo: true
                }
            });

            if (!horario) return res.json([]);

            const duracao = horario.intervalo_atendimento;

            let horarios = gerarIntervalos(
                horario.hora_inicio,
                horario.hora_fim,
                duracao
            );

            if (horario.intervalo_inicio && horario.intervalo_fim) {
                horarios = horarios.filter(h =>
                    !(h >= horario.intervalo_inicio && h < horario.intervalo_fim)
                );
            }

            const agora = new Date();
            const hojeISO = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
            const dataReq = new Date(`${data}T00:00:00`);
            const ehHoje =
                dataReq.getFullYear() === hojeISO.getFullYear() &&
                dataReq.getMonth() === hojeISO.getMonth() &&
                dataReq.getDate() === hojeISO.getDate();

            if (ehHoje) {
                const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
                horarios = horarios.filter(h => {
                    const [hh, mm] = String(h).split(':').map(Number);
                    const minutosH = hh * 60 + mm;
                    return minutosH > minutosAgora;
                });
            } else if (dataReq < hojeISO) {
                return res.json([]);
            }

            const bloqueios = await BloqueioAgenda.findAll({
                where: {
                    usuario_id: profissional_id,
                    data_inicio: { [Op.lte]: new Date(`${data}T23:59:59`) },
                    data_fim: { [Op.gte]: new Date(`${data}T00:00:00`) }
                }
            });

            const agendamentos = await Agendamento.findAll({
                where: {
                    profissional_id: Number(profissional_id),
                    data
                }
            });

            const horasOcupadas = new Set(agendamentos.map(a => toHHmm(a.hora)).filter(Boolean));

            horarios = horarios.filter(h => !horasOcupadas.has(toHHmm(h)));

            if (bloqueios.length > 0) {
                horarios = horarios.filter(h => {
                    const horaData = new Date(`${data}T${h}:00`);
                    return !bloqueios.some(b =>
                        horaData >= b.data_inicio && horaData < b.data_fim
                    );
                });
            }

            return res.json(horarios);
        } catch (err) {
            console.log(err);
            return res.status(400).json({ error: err.message });
        }
    },

    async create(req, res) {
        try {
            const { profissional_id, data, hora } = req.body;

            const config = await Configuracoes.findOne();

            if (config?.bloquear_agendamentos) {
                const limite = new Date(config.bloquear_agendamentos);
                if (new Date(data) <= limite) {
                    return res.status(400).json({
                        error: 'Agendamentos estão bloqueados para esta data.'
                    });
                }
            }

            const diaSemana = new Date(data).getDay();

            const horario = await HorarioFuncionamento.findOne({
                where: {
                    usuario_id: profissional_id,
                    dia_semana: diaSemana + 1,
                    ativo: true
                }
            });

            if (!horario) {
                return res.status(400).json({
                    error: 'Profissional não atende nesse dia.'
                });
            }

            if (hora < horario.hora_inicio || hora >= horario.hora_fim) {
                return res.status(400).json({
                    error: 'Horário fora do expediente.'
                });
            }

            if (
                horario.intervalo_inicio &&
                horario.intervalo_fim &&
                hora >= horario.intervalo_inicio &&
                hora < horario.intervalo_fim
            ) {
                return res.status(400).json({
                    error: 'Horário dentro do intervalo.'
                });
            }

            const conflito = await Agendamento.findOne({
                where: {
                    profissional_id,
                    data,
                    hora
                }
            });

            if (conflito) {
                return res.status(400).json({
                    error: 'Este horário já está ocupado.'
                });
            }

            const bloqueio = await BloqueioAgenda.findOne({
                where: {
                    usuario_id: profissional_id,
                    data_inicio: { [Op.lte]: new Date(`${data}T${hora}:00`) },
                    data_fim: { [Op.gte]: new Date(`${data}T${hora}:00`) }
                }
            });

            if (bloqueio) {
                return res.status(400).json({
                    error: 'Horário bloqueado.'
                });
            }

            const agendamento = await Agendamento.create(req.body);

            req.io?.emit('agendamento:created', {
                id: agendamento.id,
                data: agendamento
            });

            return res.json(agendamento);

        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async list(req, res) {
        try {
            const where = {};
            if (req.query.paciente_id) where.paciente_id = req.query.paciente_id;
            if (req.query.profissional_id) where.profissional_id = req.query.profissional_id;
            if (req.query.status) where.status = req.query.status;
            if (req.query.tipo) where.tipo = req.query.tipo;
            if (req.query.data) where.data = req.query.data;

            const agendamentos = await Agendamento.findAll({
                where,
                include: [
                    { model: Usuario, as: 'paciente' },
                    { model: Usuario, as: 'profissional' },
                ],
                order: [['data', 'ASC'], ['hora', 'ASC']],
            });

            return res.json(agendamentos);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async get(req, res) {
        try {
            const agendamento = await Agendamento.findByPk(req.params.id, {
                include: [
                    { model: Usuario, as: 'paciente' },
                    { model: Usuario, as: 'profissional' },
                ],
            });

            if (!agendamento)
                return res.status(404).json({ error: 'Agendamento não encontrado' });

            return res.json(agendamento);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const agendamento = await Agendamento.findByPk(req.params.id);
            if (!agendamento)
                return res.status(404).json({ error: 'Agendamento não encontrado' });

            await agendamento.update(req.body);

            req.io?.emit('agendamento:updated', {
                id: agendamento.id,
                data: agendamento
            });

            return res.json(agendamento);

        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const agendamento = await Agendamento.findByPk(req.params.id);
            if (!agendamento)
                return res.status(404).json({ error: 'Agendamento não encontrado' });

            const id = agendamento.id;
            await agendamento.destroy();

            req.io?.emit('agendamento:deleted', { id });

            return res.json({ ok: true });

        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },
};
