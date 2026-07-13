import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * SuperuserProtectedRoute — Guards all routes under /admin
 * 
 * Access rules:
 *   loading          → show spinner (prevents flash-redirect on page refresh)
 *   not logged in    → redirect to /login
 *   is_superuser     → grant access
 *   other groups     → redirect to their group-specific dashboard
 *   regular customer → redirect to /dashboard
 * 
 * This replaces AdminProtectedRoute which allowed both staff AND superusers
 * to access the same /admin route. Now /admin is strictly superuser-only.
 * 
 * NOTE: AdminProtectedRoute.jsx is preserved for backward compatibility but
 * new routes should use this component.
 */
const SuperuserProtectedRoute = () => {
  const { user, loading, getDashboardRoute } = useAuth();
  const location = useLocation();

  // Wait for session restoration before making routing decisions
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 gap-3">
        <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
        <span className="text-sm text-slate-400 font-medium">Verifying superuser access…</span>
      </div>
    );
  }

  // No session — redirect to login, preserve destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Must be a superuser
  if (!user.is_superuser) {
    // Redirect to the user's correct dashboard based on their groups
    const dashboardRoute = getDashboardRoute();
    return <Navigate to={dashboardRoute || '/dashboard'} replace />;
  }

  return <Outlet />;
};

export default SuperuserProtectedRoute;
