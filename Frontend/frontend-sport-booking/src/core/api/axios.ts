import axios, { type InternalAxiosRequestConfig } from 'axios';
import { STORAGE_KEYS } from '../../shared/constants/storage';
import { ROUTES } from '../../shared/constants/routes';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(STORAGE_KEYS.accessToken);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
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

export default axiosInstance;
