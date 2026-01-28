import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://real-estate-matching.onrender.com/api',
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor for auth and server errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      // Expired or invalid token: clear session and redirect to login
      localStorage.removeItem('token');
      toast.error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى.');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      // Forbidden: redirect to not authorized page
      toast.error('لا تملك صلاحيات كافية لتنفيذ هذا الإجراء.');
      if (window.location.pathname !== '/not-authorized') {
        window.location.href = '/not-authorized';
      }
    } else if (status === 500) {
      toast.error('حدث خطأ غير متوقع في الخادم، يرجى المحاولة لاحقاً.');
    }

    return Promise.reject(error);
  }
);

export default api;
