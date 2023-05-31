import axios from 'axios';

const APP_HOST = process.env.APP_HOST || '192.168.0.35'
const APP_PORT = process.env.APP_PORT || '8000'

axios.defaults.baseURL = `http://${APP_HOST}:${APP_PORT}/`

