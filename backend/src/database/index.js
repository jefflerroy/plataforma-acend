const Sequelize = require('sequelize');
const dbConfig = require('../config/database');

const Usuario = require('../models/Usuario');
const Dieta = require('../models/Dieta');
const Refeicao = require('../models/Refeicao');
const DietaUsuario = require('../models/DietaUsuario');
const Exame = require('../models/Exame');
const Agendamento = require('../models/Agendamento');
const Post = require('../models/Post');
const PostCurtida = require('../models/PostCurtida');
const PostComentario = require('../models/PostComentario');
const HorarioFuncionamento = require('../models/HorarioFuncionamento');
const BloqueioAgenda = require('../models/BloqueioAgenda');
const Configuracoes = require('../models/Configuracoes');

const connection = new Sequelize(dbConfig);

Usuario.init(connection);
Dieta.init(connection);
Refeicao.init(connection);
DietaUsuario.init(connection);
Exame.init(connection);
Agendamento.init(connection);
Post.init(connection);
PostCurtida.init(connection);
PostComentario.init(connection);
HorarioFuncionamento.init(connection);
BloqueioAgenda.init(connection);
Configuracoes.init(connection);

Usuario.associate(connection.models);
Dieta.associate(connection.models);
Refeicao.associate(connection.models);
DietaUsuario.associate(connection.models);
Exame.associate(connection.models);
Agendamento.associate(connection.models);
Post.associate(connection.models);
PostCurtida.associate(connection.models);
PostComentario.associate(connection.models);
HorarioFuncionamento.associate(connection.models);
BloqueioAgenda.associate(connection.models);
Configuracoes.associate(connection.models);

module.exports = connection;
