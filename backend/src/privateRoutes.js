const express = require('express');

const auth = require('./auth/auth');
const UsuarioController = require('./controllers/UsuarioController');
const DietaController = require('./controllers/DietaController');
const RefeicaoController = require('./controllers/RefeicaoController');
const DietaUsuarioController = require('./controllers/DietaUsuarioController');
const ExameController = require('./controllers/ExameController');
const AgendamentoController = require('./controllers/AgendamentoController');
const PostController = require('./controllers/PostController');
const PostCurtidaController = require('./controllers/PostCurtidaController');
const PostComentarioController = require('./controllers/PostComentarioController');

const privateRoutes = express.Router();

privateRoutes.get('/api/usuarios', auth.onlyAdmin, UsuarioController.list);
privateRoutes.get('/api/me', UsuarioController.me);
privateRoutes.get('/api/pacientes', auth.onlyAdminOrMedico, UsuarioController.listPacientes);
privateRoutes.get('/api/usuarios/:id', auth.onlyAdmin, UsuarioController.get);
privateRoutes.post('/api/usuarios', auth.onlyAdmin, UsuarioController.create);
privateRoutes.post('/api/pacientes', auth.onlyAdminOrMedico, UsuarioController.createPaciente);
privateRoutes.put('/api/usuarios/:id', UsuarioController.update);
privateRoutes.delete('/api/usuarios/:id', auth.onlyAdmin, UsuarioController.delete);

privateRoutes.get('/api/dietas', DietaController.list);
privateRoutes.get('/api/dietas/:id', DietaController.get);
privateRoutes.post('/api/dietas', DietaController.create);
privateRoutes.put('/api/dietas/:id', DietaController.update);
privateRoutes.delete('/api/dietas/:id', DietaController.delete);

privateRoutes.get('/api/refeicoes', RefeicaoController.list);
privateRoutes.get('/api/refeicoes/:id', RefeicaoController.get);
privateRoutes.post('/api/refeicoes', RefeicaoController.create);
privateRoutes.put('/api/refeicoes/:id', RefeicaoController.update);
privateRoutes.delete('/api/refeicoes/:id', RefeicaoController.delete);

privateRoutes.get('/api/dietas-usuarios', DietaUsuarioController.list);
privateRoutes.get('/api/dietas-usuarios/:id', DietaUsuarioController.get);
privateRoutes.post('/api/dietas-usuarios', DietaUsuarioController.create);
privateRoutes.put('/api/dietas-usuarios/:id', DietaUsuarioController.update);
privateRoutes.delete('/api/dietas-usuarios/:id', DietaUsuarioController.delete);
privateRoutes.get('/api/minha-dieta', DietaUsuarioController.minhaDieta);

privateRoutes.get('/api/exames', ExameController.list);
privateRoutes.get('/api/exames/:id', ExameController.get);
privateRoutes.post('/api/exames', ExameController.create);
privateRoutes.put('/api/exames/:id', ExameController.update);
privateRoutes.delete('/api/exames/:id', ExameController.delete);

privateRoutes.get('/api/agendamentos', AgendamentoController.list);
privateRoutes.get('/api/agendamentos/:id', AgendamentoController.get);
privateRoutes.post('/api/agendamentos', AgendamentoController.create);
privateRoutes.put('/api/agendamentos/:id', AgendamentoController.update);
privateRoutes.delete('/api/agendamentos/:id', AgendamentoController.delete);

privateRoutes.get('/api/posts', PostController.list);
privateRoutes.get('/api/posts/:id', PostController.get);
privateRoutes.post('/api/posts', PostController.create);
privateRoutes.put('/api/posts/:id', PostController.update);
privateRoutes.delete('/api/posts/:id', PostController.delete);
privateRoutes.post('/api/posts/like', PostController.like);
privateRoutes.post('/api/posts/unlike', PostController.unlike);
privateRoutes.post('/api/posts/comment', PostController.comment);

privateRoutes.get('/api/posts-curtidas', PostCurtidaController.list);
privateRoutes.get('/api/posts-curtidas/:id', PostCurtidaController.get);
privateRoutes.post('/api/posts-curtidas', PostCurtidaController.create);
privateRoutes.put('/api/posts-curtidas/:id', PostCurtidaController.update);
privateRoutes.delete('/api/posts-curtidas/:id', PostCurtidaController.delete);

privateRoutes.get('/api/posts-comentarios', PostComentarioController.list);
privateRoutes.get('/api/posts-comentarios/:id', PostComentarioController.get);
privateRoutes.post('/api/posts-comentarios', PostComentarioController.create);
privateRoutes.put('/api/posts-comentarios/:id', PostComentarioController.update);
privateRoutes.delete('/api/posts-comentarios/:id', PostComentarioController.delete);

module.exports = privateRoutes;
