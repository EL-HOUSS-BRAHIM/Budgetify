import api from './api';
import { setItem, getItem, removeItem } from './storage';

const TOKEN_KEY = 'auth_token';

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    setToken(response.data.access_token);
    //console.log('Token set after login:', response.data.access_token); // Add this line for debugging
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const register = async (user) => {
  try {
    const response = await api.post('/auth/register', user);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

export const logout = () => {
  removeToken();
  window.location.href = '/login';  // Redirect to login page on logout
};

export const setToken = (token) => {
  setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  const token = getItem(TOKEN_KEY);
  return token;
};

export const removeToken = () => {
  removeItem(TOKEN_KEY);
};

export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

export const useAuth = () => {
  return {
    isAuthenticated: isAuthenticated(),
    login,
    logout,
    register
  };
};
