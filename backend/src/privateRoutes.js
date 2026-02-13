const express = require('express');

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

privateRoutes.get('/usuarios', UsuarioController.list);
privateRoutes.get('/usuarios/:id', UsuarioController.get);
privateRoutes.post('/usuarios', UsuarioController.create);
privateRoutes.put('/usuarios/:id', UsuarioController.update);
privateRoutes.delete('/usuarios/:id', UsuarioController.delete);

privateRoutes.get('/dietas', DietaController.list);
privateRoutes.get('/dietas/:id', DietaController.get);
privateRoutes.post('/dietas', DietaController.create);
privateRoutes.put('/dietas/:id', DietaController.update);
privateRoutes.delete('/dietas/:id', DietaController.delete);

privateRoutes.get('/refeicoes', RefeicaoController.list);
privateRoutes.get('/refeicoes/:id', RefeicaoController.get);
privateRoutes.post('/refeicoes', RefeicaoController.create);
privateRoutes.put('/refeicoes/:id', RefeicaoController.update);
privateRoutes.delete('/refeicoes/:id', RefeicaoController.delete);

privateRoutes.get('/dietas-usuarios', DietaUsuarioController.list);
privateRoutes.get('/dietas-usuarios/:id', DietaUsuarioController.get);
privateRoutes.post('/dietas-usuarios', DietaUsuarioController.create);
privateRoutes.put('/dietas-usuarios/:id', DietaUsuarioController.update);
privateRoutes.delete('/dietas-usuarios/:id', DietaUsuarioController.delete);

privateRoutes.get('/exames', ExameController.list);
privateRoutes.get('/exames/:id', ExameController.get);
privateRoutes.post('/exames', ExameController.create);
privateRoutes.put('/exames/:id', ExameController.update);
privateRoutes.delete('/exames/:id', ExameController.delete);

privateRoutes.get('/agendamentos', AgendamentoController.list);
privateRoutes.get('/agendamentos/:id', AgendamentoController.get);
privateRoutes.post('/agendamentos', AgendamentoController.create);
privateRoutes.put('/agendamentos/:id', AgendamentoController.update);
privateRoutes.delete('/agendamentos/:id', AgendamentoController.delete);

privateRoutes.get('/posts', PostController.list);
privateRoutes.get('/posts/:id', PostController.get);
privateRoutes.post('/posts', PostController.create);
privateRoutes.put('/posts/:id', PostController.update);
privateRoutes.delete('/posts/:id', PostController.delete);
privateRoutes.post('/posts/like', PostController.like);
privateRoutes.post('/posts/unlike', PostController.unlike);
privateRoutes.post('/posts/comment', PostController.comment);

privateRoutes.get('/posts-curtidas', PostCurtidaController.list);
privateRoutes.get('/posts-curtidas/:id', PostCurtidaController.get);
privateRoutes.post('/posts-curtidas', PostCurtidaController.create);
privateRoutes.put('/posts-curtidas/:id', PostCurtidaController.update);
privateRoutes.delete('/posts-curtidas/:id', PostCurtidaController.delete);

privateRoutes.get('/posts-comentarios', PostComentarioController.list);
privateRoutes.get('/posts-comentarios/:id', PostComentarioController.get);
privateRoutes.post('/posts-comentarios', PostComentarioController.create);
privateRoutes.put('/posts-comentarios/:id', PostComentarioController.update);
privateRoutes.delete('/posts-comentarios/:id', PostComentarioController.delete);

module.exports = privateRoutes;
