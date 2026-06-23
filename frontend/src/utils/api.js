import axios from 'axios';


const PRODUCTION_BACKEND_URL = "http://whatsappbackend1-zk959lia.b4a.run/";


const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';


const baseURL = isLocalhost 
  ? (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api'
  : PRODUCTION_BACKEND_URL + '/api';

const api = axios.create({ 
  baseURL,
  withCredentials: true 
});


api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;