import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const http = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use(config => {
  const token = localStorage.getItem('ethiolegal_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
