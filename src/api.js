import axios from 'axios';

// Create an Axios instance using your .env configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// A smart security interceptor: It automatically grabs your login token 
// from localStorage and attaches it to headers if it exists.
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;