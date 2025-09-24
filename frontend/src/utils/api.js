import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    
    // If unauthorized, clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Show error toast
    toast.error(message);
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },
  
  login: async (userData) => {
    const response = await api.post('/auth/login', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// QR Code API calls
export const qrCodeAPI = {
  generate: async (qrData) => {
    const response = await api.post('/qrcodes', qrData);
    return response.data;
  },
  
  getHistory: async (page = 1, limit = 20) => {
    const response = await api.get(`/qrcodes/history?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/qrcodes/${id}`);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/qrcodes/${id}`);
    return response.data;
  }
};

export default api;
