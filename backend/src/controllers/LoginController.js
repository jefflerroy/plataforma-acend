const auth = require('../auth/auth');
const { Op, where } = require('sequelize');
const md5 = require('md5');
const jsonwebtoken = require('jsonwebtoken');

module.exports = {
    async loginUsuario(req, res) {
        try {           

            
        } catch (err) {
            console.log(err);
            return res.status(400).json({ error: 'Erro ao fazer o login.', details: err.message });
        }
    },
}