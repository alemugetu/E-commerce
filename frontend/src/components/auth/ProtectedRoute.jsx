import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute — guards customer-facing routes under /dashboard.
 *
 * Rules:
 *   - Not logged in       → redirect to /login (preserving intended destination)
 *   - User with groups    → redirect to their group-specific dashboard
 *   - Superuser           → redirect to /admin
 *   - Regular customer    → render children normally
 */
const ProtectedRoute = ({ children }) => {
  const { user, getDashboardRoute } = useAuth();
  const location = useLocation();

  // No active session → send to login, remembering where they wanted to go
  if (!user) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // User with groups or superuser trying to access customer dashboard → redirect to correct dashboard
  const dashboardRoute = getDashboardRoute();
  if (dashboardRoute && dashboardRoute !== '/dashboard') {
    return <Navigate to={dashboardRoute} replace />;
  }

  // Authenticated regular customer → render the requested component
  return children;
};

export default ProtectedRoute;


