// src/config/api.js
const API_URL = import.meta.env.VITE_API_URL || 'https://smartsach-fdt.onrender.com';

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
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
    throw new Error(error.error || error.detail || 'Error en la petición');
  }

  return response.json();
};

export const getToken = () => localStorage.getItem('token');

export const saveSession = (data) => {
  if (data.token) localStorage.setItem('token', data.token);
  if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};