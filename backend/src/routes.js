const { Router } = require('express');
const routes = Router();
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { success: false, message: 'Muitas tentativas, tente novamente em 15 minutos.' }
});

const LoginController = require('./controllers/LoginController');
const SitemapController = require('./controllers/SitemapController');

routes.post('/api/loginUsuario', limiter, LoginController.loginUsuario);

routes.get('/api/sitemap.txt', SitemapController.sitemap)


module.exports = routes;