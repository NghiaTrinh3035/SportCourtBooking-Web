import axios, { type InternalAxiosRequestConfig } from 'axios';
import { ROUTES } from '../constants/routes';
import { STORAGE_KEYS } from '../constants/storage';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

const httpClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(STORAGE_KEYS.accessToken);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem(STORAGE_KEYS.accessToken);
      localStorage.removeItem(STORAGE_KEYS.user);

      const isAuthPage =
        window.location.pathname === ROUTES.login ||
        window.location.pathname === ROUTES.register;

      if (!isAuthPage) {
        window.location.href = ROUTES.login;
      }
    }

    return Promise.reject(error);
  },
);

export default httpClient;
