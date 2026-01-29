import axios from 'axios';

const api = axios.create()

api.defaults.headers.common['Access-Control-Allow-Origin'] = "*";
api.defaults.baseURL = window.location.host.includes('ascend') ? 'https://www.ascend.com/api' : 'http://192.168.100.46:3333/api';

export default api;