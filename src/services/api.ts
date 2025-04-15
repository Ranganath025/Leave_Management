
import axios from 'axios';
import { isDemoUser } from '@/lib/utils';

// Determine the API URL based on the environment
const getApiUrl = () => {
  // For vercel environment
  if (window.location.origin.includes('vercel.app')) {
    return `${window.location.origin}/api`;
  }
  // For local development
  return "http://localhost:5000/api";
};

const API_URL = getApiUrl();

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Check if we're in demo mode
const isDemoMode = () => {
  const userEmail = localStorage.getItem('userEmail');
  return userEmail ? isDemoUser(userEmail) : false;
};

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    
    // If we're in demo mode and not trying to login, throw a controlled error
    if (isDemoMode() && !config.url?.includes('/auth/login')) {
      // Only throw for non-GET requests in demo mode
      if (config.method !== 'get') {
        console.log('Demo mode intercepted write operation:', config.url);
        // This is just for nicer demo handling, don't actually throw for GET requests
        return config;
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors to help with debugging
    console.error('API Error:', error);
    
    if (error.response) {
      // Handle authentication errors
      if (error.response.status === 401) {
        // Don't clear token for demo accounts
        if (!isDemoMode()) {
          // Clear token and redirect to login if unauthorized
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me')
};

// Leaves API
export const leavesAPI = {
  getAllLeaves: () => api.get('/leaves/all'),
  getTeamLeaves: () => api.get('/leaves/team'),
  getPendingLeaves: () => api.get('/leaves/pending'),
  getUserLeaves: () => api.get('/leaves/me'),
  getLeaveById: (id) => api.get(`/leaves/${id}`),
  createLeave: (leaveData) => api.post('/leaves', leaveData),
  updateLeaveStatus: (id, statusData) => api.put(`/leaves/${id}/status`, statusData),
  cancelLeave: (id) => api.delete(`/leaves/${id}`)
};

// Users API
export const usersAPI = {
  getAllUsers: () => api.get('/users'),
  getTeamMembers: () => api.get('/users/team'),
  getUserById: (id) => api.get(`/users/${id}`),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  changePassword: (passwordData) => api.put('/users/change-password', passwordData),
  deleteUser: (id) => api.delete(`/users/${id}`)
};

export default api;
