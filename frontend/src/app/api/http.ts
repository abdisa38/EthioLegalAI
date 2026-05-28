import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const http = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

http.interceptors.request.use(config => {
  const token = localStorage.getItem('ethiolegal_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const refreshClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

const onRefreshed = (token: string | null) => {
  pendingRequests.forEach(callback => callback(token));
  pendingRequests = [];
};

http.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise(resolve => {
        pendingRequests.push((token) => {
          if (token) {
            original.headers = original.headers || {};
            original.headers.Authorization = `Bearer ${token}`;
          }
          resolve(http(original));
        });
      });
    }

    isRefreshing = true;
    try {
      const { data } = await refreshClient.post<{ token: string }>('/auth/refresh');
      localStorage.setItem('ethiolegal_token', data.token);
      onRefreshed(data.token);
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${data.token}`;
      return http(original);
    } catch (refreshError) {
      localStorage.removeItem('ethiolegal_token');
      onRefreshed(null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
