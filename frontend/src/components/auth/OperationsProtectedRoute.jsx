import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canAccessOperationsDashboard, isInGroup } from '../../config/groupRoutes';

/**
 * OperationsProtectedRoute — Guards all routes under /operations
 * 
 * Access rules:
 *   loading          → show spinner (prevents flash-redirect on page refresh)
 *   not logged in    → redirect to /login
 *   is_superuser     → redirect to /admin (superusers have their own dashboard)
 *   Seller           → redirect to /seller (Seller has standalone dashboard)
 *   operational user → grant access to Operations Dashboard
 *   regular customer → redirect to /dashboard
 *   unauthorized     → redirect to Access Denied page
 */
const OperationsProtectedRoute = () => {
  const { user, loading, getDashboardRoute } = useAuth();
  const location = useLocation();

  // Wait for session restoration before making routing decisions
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 gap-3">
        <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        <span className="text-sm text-slate-400 font-medium">Verifying access…</span>
      </div>
    );
  }

  // No session — redirect to login, preserve destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Superusers have their own dashboard
  if (user.is_superuser) {
    return <Navigate to="/admin" replace />;
  }

  // Seller has standalone dashboard - redirect away from Operations
  if (isInGroup(user.groups, 'Seller')) {
    return <Navigate to="/seller" replace />;
  }

  // Must be an operational user to access Operations Dashboard
  if (!canAccessOperationsDashboard(user.groups, user.is_superuser)) {
    // Redirect to the user's correct dashboard or Access Denied
    const dashboardRoute = getDashboardRoute();
    
    // If user has no valid dashboard, show Access Denied page
    if (!dashboardRoute || dashboardRoute === '/dashboard') {
      return <Navigate to="/access-denied" replace />;
    }
    
    return <Navigate to={dashboardRoute} replace />;
  }

  return <Outlet />;
};

export default OperationsProtectedRoute;
