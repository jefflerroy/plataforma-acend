import { io } from 'socket.io-client';

const URL = window.location.host.includes('ascend') ? 'https://www.ascend.com/' : 'http://192.168.100.46:3333/';

export const socket = io(URL, {
    path: '/api/seacher',
    autoConnect: false,
    transports: ['websocket'],
});
socket.connect()
