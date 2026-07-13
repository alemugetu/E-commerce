import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api, setLocalAccessToken } from '../services/api';
import { getDashboardRouteForGroups, isInGroup } from '../config/groupRoutes';

const AuthContext = createContext(null);

/**
 * Decodes a JWT access token and extracts the user profile claims
 * injected by CustomTokenObtainPairSerializer on the backend.
 * Returns null if the token is missing, malformed, or expired.
 */
const decodeTokenToUser = (accessToken) => {
  if (!accessToken) return null;
  try {
    const base64Url = accessToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(window.atob(base64));

    // Guard against tokens that are already past their expiry time
    if (claims.exp && Date.now() / 1000 > claims.exp) return null;

    return {
      id: claims.user_id,
      email: claims.email || '',
      is_staff: claims.is_staff === true,
      is_superuser: claims.is_superuser === true,
      // first_name / last_name come from the profile endpoint — seeded as empty
      // strings here and enriched after the profile fetch below.
      first_name: claims.first_name || '',
      last_name: claims.last_name || '',
      // Decode user's Django groups from JWT for permission-driven routing
      groups: claims.groups || [],
    };
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);

  // Fetch user permissions from backend
  const fetchPermissions = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/permissions/');
      setPermissions(data.permissions || []);
    } catch (e) {
      // Silently ignore – missing auth will be handled elsewhere
      setPermissions([]);
    }
  }, []);

  // After we have a decoded user (post‑login or token refresh), load permissions
  useEffect(() => {
    if (user) {
      fetchPermissions();
    } else {
      setPermissions([]);
    }
  }, [user, fetchPermissions]);

  // Keeps a ref so logout() can redirect without needing react-router hooks
  // (AuthContext sits above the Router in the tree)
  const navigateRef = useRef(null);
  const setNavigate = (fn) => { navigateRef.current = fn; };

  // ------------------------------------------------------------------
  // Derived role helpers for cleaner component logic
  // Now based on Django Groups instead of is_staff flags
  // ------------------------------------------------------------------
  const isSeller = isInGroup(user?.groups, 'Seller');
  const isSuperuser = user?.is_superuser === true;
  const isCustomer = user && !user.is_superuser && (!user.groups || user.groups.length === 0);

  // ------------------------------------------------------------------
  // Enrich the decoded token user with full name from the profile API.
  // Called after every successful token acquisition so the navbar always
  // displays the correct initials — even on a hard page refresh.
  // ------------------------------------------------------------------
  const enrichUserFromProfile = useCallback(async (baseUser) => {
    if (!baseUser) return;
    try {
      const { data } = await api.get('/auth/profile/');
      setUser({
        ...baseUser,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone_number: data.phone_number || '',
        addresse: data.addresse || '',
        // Make sure to preserve all baseUser properties like groups, is_staff, is_superuser!
      });
    } catch {
      // Profile fetch failing is non-fatal — keep the base decoded user
      setUser(baseUser);
    }
  }, []);

  // ------------------------------------------------------------------
  // Silent token refresh — runs on every app boot and when the
  // Axios 401 interceptor triggers a refresh cycle.
  // ------------------------------------------------------------------
  const refreshAuthToken = useCallback(async () => {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      setLocalAccessToken(null);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/token/refresh/', { refresh: refreshToken });
      const { access } = response.data;

      setLocalAccessToken(access);

      // Decode the fresh access token to hydrate user state immediately
      const decoded = decodeTokenToUser(access);
      await enrichUserFromProfile(decoded);
    } catch (error) {
      console.error('Session expired. Clearing auth states.');
      localStorage.removeItem('refresh_token');
      setLocalAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [enrichUserFromProfile]);

  // Boot-time session restoration
  useEffect(() => {
    refreshAuthToken();
  }, [refreshAuthToken]);

  // ------------------------------------------------------------------
  // Login
  // ------------------------------------------------------------------
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login/', { email, password });
      const { access, refresh } = response.data;

      if (!access || !refresh) {
        throw new Error('Backend failed to return standard JWT token bundle.');
      }

      // Commit tokens
      setLocalAccessToken(access);
      localStorage.setItem('refresh_token', refresh);

      // Decode claims immediately so is_staff / is_superuser are available
      // before the profile fetch completes
      const decoded = decodeTokenToUser(access);
      await enrichUserFromProfile(decoded);

      // Return decoded user alongside success so callers (e.g. Login page) can
      // make role-based redirect decisions without waiting for a re-render.
      return { success: true, user: decoded };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.detail ||
          'Invalid email or password.',
      };
    }
  };

  // ------------------------------------------------------------------
  // Logout — clears all tokens, wipes state, redirects to /login
  // ------------------------------------------------------------------
  const logout = useCallback(() => {
    localStorage.removeItem('refresh_token');
    setLocalAccessToken(null);
    setUser(null);
    // Hard redirect — works even when called from outside the Router tree
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      refreshAuthToken, 
      setNavigate,
      permissions,
      // Derived role flags for UI logic
      isSeller,
      isSuperuser,
      isCustomer,
      // Group-based routing helper
      getDashboardRoute: () => getDashboardRouteForGroups(user?.groups || [], user?.is_superuser || false),
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be called within an AuthProvider layout shell.');
  return context;
};

