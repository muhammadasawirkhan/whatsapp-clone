import axios from 'axios';

const isLocalhost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

// IMPORTANT: Replace this with the EXACT URL shown on your B4A dashboard.
// Copy-paste it directly from there — do not retype it by hand.
const PRODUCTION_BACKEND_URL =
  import.meta.env.VITE_PRODUCTION_BACKEND_URL ||
  'https://whatsappbackend1-zk9591ia.b4a.run'; // <-- double check this against your B4A dashboard

const baseURL = isLocalhost
  ? (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api'
  : PRODUCTION_BACKEND_URL + '/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;