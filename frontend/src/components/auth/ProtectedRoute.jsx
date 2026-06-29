import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute — guards customer-facing routes under /dashboard.
 *
 * Rules:
 *   - Not logged in       → redirect to /login (preserving intended destination)
 *   - Admin (is_staff or is_superuser) → redirect to /admin (wrong dashboard)
 *   - Regular customer    → render children normally
 */
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
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

  // Admin user trying to access the customer dashboard → redirect to admin panel
  if (user.is_staff || user.is_superuser) {
    return <Navigate to="/admin" replace />;
  }

  // Authenticated regular customer → render the requested component
  return children;
};

export default ProtectedRoute;


