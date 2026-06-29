import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`
});

// Attach the JWT token (if present) to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to build a full URL for files served from /uploads (documents, attachments)
export function fileUrl(relativePath) {
  if (!relativePath) return null;
  return `${API_URL}${relativePath}`;
}

export default api;
