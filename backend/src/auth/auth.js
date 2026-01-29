require('dotenv').config();
const jsonwebtoken = require('jsonwebtoken');
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
    PRIVATE_KEY,

    tokenValited(req, res, next) {                
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ error: 'Acesso indisponível, token não informado.' })
    
        try {
            const payload = jsonwebtoken.verify(token, PRIVATE_KEY);            
    
            if(!payload) {
                return res.status(401).json({ error: 'Token inválido.' })
            }
            
            return next();
        } catch (err) {
            console.log(err);
            return res.status(401).json({ error: 'Token inválido.' })
        }
    }    
};