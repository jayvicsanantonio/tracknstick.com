import axios, { AxiosError } from 'axios';
import getConfig from '@/lib/getConfig';

const { apiHost } = getConfig();

const axiosInstance = axios.create({
  baseURL: apiHost,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      if (window.Clerk?.session) {
        const token = await window.Clerk.session.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else {
        console.warn('Clerk session not available for attaching token.');
      }
    } catch (error) {
      console.error('Error getting Clerk token in interceptor:', error);
    }
    return config;
  },
  (error: AxiosError) => {
    const errorMessage = `Request failed: ${error.message}`;
    return Promise.reject(new Error(errorMessage));
  },
);

export default axiosInstance;
