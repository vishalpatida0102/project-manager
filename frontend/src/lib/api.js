import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const status = err.response?.status;
    const message = err.response?.data?.message || err.message || 'Something went wrong';

    if (status === 401) {
      const { token, logout } = useAuthStore.getState();
      if (token) {
        logout();
        toast.error('Your session expired. Please sign in again.');
      }
    } else if (status >= 500) {
      toast.error('Server error — please try again.');
    }

    return Promise.reject({
      status,
      message,
      details: err.response?.data?.details,
    });
  }
);

export default api;
