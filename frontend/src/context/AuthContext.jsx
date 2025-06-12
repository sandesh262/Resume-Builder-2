import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to check if user is authenticated
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsLoading(false);
      return null;
    }

    try {
      const response = await api.get('/auth');
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', {
        email: credentials.email || credentials.username,
        password: credentials.password
      });

      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        const userData = await checkAuth();
        return { success: true, user: userData };
      }
      
      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.errors?.[0]?.msg || 'Login failed';
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await api.post('/auth/register', {
        name: userData.username,
        email: userData.email || `${userData.username}@example.com`,
        password: userData.password
      });

      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        const userData = await checkAuth();
        return { success: true, user: userData };
      }
      
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.errors?.[0]?.msg || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};