require('dotenv').config();
const { Server } = require("socket.io");
const express = require('express');
const routes = require('./src/routes');
const cors = require('cors');
const privateRoutes = require('./src/privateRoutes');
const auth = require('./src/auth/auth');
require('./src/database');

const app = express();
const server = require('http').createServer(app);

const io = new Server(server, {
    path: '/api/seacher',
    transports: ['websocket']
});

app.use((req, res, next) => {
    req.io = io;
    next();
});

if(app.get('env') === 'development'){
    app.use(cors());
} else {
    app.use(cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
}
app.use(express.json({ limit: '50mb' }));
app.use(routes);
app.use('*', auth.tokenValited);
app.use(privateRoutes);
server.listen(3333);