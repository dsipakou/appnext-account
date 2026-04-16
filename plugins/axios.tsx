import axios from 'axios';

const API_HOST = process.env.NEXT_PUBLIC_API_HOST;
const API_PORT = process.env.NEXT_PUBLIC_API_PORT;
const API_SCHEMA = process.env.NEXT_PUBLIC_API_SCHEMA;

let url;

if (process.env.NEXT_PUBLIC_ENV_TYPE === 'prod') {
  url = `${API_SCHEMA}://${API_HOST}/`;
} else {
  url = `${API_SCHEMA}://${API_HOST}:${API_PORT}/`;
}

axios.defaults.baseURL = url;

export const fetchReq = (url: string) => axios.get(url).then((res) => res.data);
export const postReq = (url: string, { arg }) => axios.post(url, arg).then((res) => res.data);
export const deleteReq = (url: string) => axios.delete(url).then((res) => res.data);
export const patchReq = (url: string, { arg }) => axios.patch(url, arg).then((res) => res.data);
export const downloadFile = (url: string, filename: string): Promise<void> =>
  axios.get(url, { responseType: 'blob' }).then((res) => {
    const href = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(href);
  });
