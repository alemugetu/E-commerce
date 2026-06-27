import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setLocalAccessToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Unified silent refresh method
  const refreshAuthToken = useCallback(async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      setLocalAccessToken(null);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // FIX: Passing the actual token body instead of an empty object {}
      const response = await api.post('/auth/token/refresh/', { refresh: refreshToken });
      const { access, user: userPayload } = response.data;

      setLocalAccessToken(access);
      if (userPayload) setUser(userPayload);
    } catch (error) {
      console.error("Session expired. Clearing auth states.");
      localStorage.removeItem('refresh_token');
      setLocalAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check for existing session on application bootup
  useEffect(() => {
    refreshAuthToken();
  }, [refreshAuthToken]);

  // Updated Login handler to store the refresh token payload securely
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login/', { email, password });
      
      // Destructure tokens from your CustomTokenView response template
      const { access, refresh, user: userPayload } = response.data;
      
      if (!access || !refresh) {
        throw new Error("Backend failed to return standard JWT token bundle.");
      }

      // 1. Commit access token to active memory
      setLocalAccessToken(access);
      
      // 2. Commit refresh token to persistent storage
      localStorage.setItem('refresh_token', refresh);
      
      // 3. Update global layout states
      setUser(userPayload || { email });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.detail || "Invalid email or password." 
      };
    }
  };

  // Sign out handler to clean all states
  const logout = () => {
    localStorage.removeItem('refresh_token');
    setLocalAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be called within an AuthProvider layout shell.");
  return context;
};

