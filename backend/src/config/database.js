require('dotenv').config();
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
    dialect: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: PRIVATE_KEY,
    database: 'acend',
    define: {        
        timestamps: true,
        underscored: true 
    }
}