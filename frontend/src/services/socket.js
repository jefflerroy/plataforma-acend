import { io } from 'socket.io-client';

const URL = window.location.host.includes('metodoacend')
    ? 'https://metodoacend.online/api'
    : 'https://192.168.100.46:3333/api';

export const socket = io(URL, {
    path: '/api/seacher',
    autoConnect: false,
    transports: ['websocket'],
    auth: {
        token: localStorage.getItem('token')
    }
});

socket.connect();
