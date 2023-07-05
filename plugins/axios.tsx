import axios from 'axios';

const APP_HOST = process.env.APP_HOST || 'localhost'
const APP_PORT = process.env.APP_PORT || '8000'

console.log(APP_HOST)

axios.defaults.baseURL = `http://${APP_HOST}:${APP_PORT}/`

