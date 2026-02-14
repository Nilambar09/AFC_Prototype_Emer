import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ventur_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API functions
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me')
};

export const pitchDeckAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pitch-deck/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  analyze: (deckId) => api.post(`/pitch-deck/${deckId}/analyze`),
  getAll: () => api.get('/pitch-decks'),
  getOne: (deckId) => api.get(`/pitch-deck/${deckId}`),
  delete: (deckId) => api.delete(`/pitch-deck/${deckId}`)
};

export const dataRoomAPI = {
  getCategories: () => api.get('/data-room/categories'),
  upload: (file, category, subcategory) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (subcategory) {
      formData.append('subcategory', subcategory);
    }
    return api.post('/data-room/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  analyze: (docId) => api.post(`/data-room/${docId}/analyze`),
  getAll: (category) => api.get('/data-room', { params: { category } }),
  getOne: (docId) => api.get(`/data-room/${docId}`),
  delete: (docId) => api.delete(`/data-room/${docId}`)
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats')
};

export const historyAPI = {
  getAll: () => api.get('/history'),
  clear: () => api.delete('/history/clear')
};

export default api;
