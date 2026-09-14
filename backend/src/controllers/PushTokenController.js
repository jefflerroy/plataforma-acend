const PushToken = require("../models/PushToken");

module.exports = {
    async register(req, res) {
        try {

            console.log('CHEGOU NO PUSH REGISTER');
            console.log('USER:', req.user);
            console.log('BODY:', req.body);

            const usuario_id = req.user.id;

            const {
                token,
                plataforma,
                device
            } = req.body;

            if (!token) {
                return res.status(400).json({
                    error: "Token é obrigatório",
                });
            }

            const [pushToken, created] = await PushToken.findOrCreate({
                where: {
                    token,
                },
                defaults: {
                    usuario_id,
                    plataforma,
                    device
                },
            });

            if (!created) {
                await pushToken.update({
                    usuario_id,
                    plataforma,
                    device
                });
            }

            return res.json({
                success: true,
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                error: "Erro ao registrar dispositivo",
            });
        }
    },

    async unregister(req, res) {
        try {
            const usuario_id = req.user.id;
            const { token } = req.body;

            if (!token) {
                return res.status(400).json({
                    error: "Token é obrigatório",
                });
            }

            await PushToken.destroy({
                where: {
                    usuario_id,
                    token,
                },
            });

            return res.json({
                success: true,
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                error: "Erro ao remover dispositivo",
            });
        }
    },

    async enviarNotificacaoUsuario(req, res
    ) {
        try {
            const { usuario_id, titulo, mensagem } = req.body;


            const tokens = await PushToken.findAll({
                where: {
                    usuario_id,
                },
            });

            if (!tokens.length) {
                return {
                    success: false,
                    message: "Usuário não possui dispositivos registrados",
                };
            }

            const mensagens = tokens.map((item) => ({
                to: item.token,
                sound: "default",
                title: titulo,
                body: mensagem
            }));

            const response = await fetch(
                "https://exp.host/--/api/v2/push/send",
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(mensagens),
                }
            );

            const resultado = await response.json();

            if (!response.ok) {
                console.error("Erro Expo Push:", resultado);

                return {
                    success: false,
                    error: resultado,
                };
            }

            if (Array.isArray(resultado.data)) {
                for (let i = 0; i < resultado.data.length; i++) {
                    const ticket = resultado.data[i];

                    if (
                        ticket.status === "error" &&
                        ticket.details?.error === "DeviceNotRegistered"
                    ) {
                        await PushToken.destroy({
                            where: {
                                token: tokens[i].token,
                            },
                        });
                    }
                }
            }

            return res.json({
                success: true,
            });
        } catch (error) {
            console.error("Erro ao enviar notificação:", error);

            return {
                success: false,
                error: error.message,
            };
        }
    }
};