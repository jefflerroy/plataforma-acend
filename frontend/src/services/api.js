import axios from 'axios';

const api = axios.create({
    baseURL: window.location.host.includes('ascend')
        ? 'https://www.ascend.com/api'
        : 'http://192.168.100.46:3333/api'
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;
