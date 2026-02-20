const { Op } = require('sequelize');
const Agendamento = require('../models/Agendamento');
const Usuario = require('../models/Usuario');
const HorarioFuncionamento = require('../models/HorarioFuncionamento');
const BloqueioAgenda = require('../models/BloqueioAgenda');
const Configuracoes = require('../models/Configuracoes');

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

module.exports = {

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
            console.log('teste');
            console.log(horario.intervalo_atendimento);
            
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

            const bloqueios = await BloqueioAgenda.findAll({
                where: {
                    usuario_id: profissional_id,
                    data_inicio: { [Op.lte]: new Date(`${data}T23:59:59`) },
                    data_fim: { [Op.gte]: new Date(`${data}T00:00:00`) }
                }
            });

            const agendamentos = await Agendamento.findAll({
                where: {
                    profissional_id,
                    data
                }
            });

            const horasOcupadas = agendamentos.map(a => a.hora);

            horarios = horarios.filter(h => !horasOcupadas.includes(h));

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
                    dia_semana: diaSemana,
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
