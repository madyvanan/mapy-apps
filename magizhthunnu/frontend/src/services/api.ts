import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env['VITE_API_URL'] as string ?? 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as { _retry?: boolean; url?: string };
    if (error.response?.status === 401 && !original._retry && original.url !== '/auth/refresh') {
      original._retry = true;
      try {
        await api.post('/auth/refresh');
        return api(original);
      } catch {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
