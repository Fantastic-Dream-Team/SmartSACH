// src/config/api.js
const API_URL = import.meta.env.VITE_API_URL || 'https://tu-backend.onrender.com';

export const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error en la petición');
  }

  return response.json();
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const saveSession = (data) => {
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};