import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canAccessOperationsDashboard, isInGroup } from '../../config/groupRoutes';

/**
 * SellerProtectedRoute — Guards all routes under /seller (legacy routes)
 * 
 * This is now a legacy route for backward compatibility.
 * New operational users should use /operations routes instead.
 * 
 * Access rules:
 *   loading          → show spinner (prevents flash-redirect on page refresh)
 *   not logged in    → redirect to /login
 *   is_superuser     → redirect to /admin (superusers have their own dashboard)
 *   in Seller group  → grant access (legacy compatibility)
 *   other groups     → redirect to their group-specific dashboard
 *   regular customer → redirect to /dashboard
 */
const SellerProtectedRoute = () => {
  const { user, loading, getDashboardRoute } = useAuth(); 
  const location = useLocation();

  // Wait for session restoration before making routing decisions
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 gap-3">
        <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Verifying seller access…</span>
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

  // Must be in the Seller group for legacy /seller routes
  if (!isInGroup(user.groups, 'Seller')) {
    // Redirect to the user's correct dashboard based on their groups
    const dashboardRoute = getDashboardRoute();
    return <Navigate to={dashboardRoute || '/dashboard'} replace />;
  }

  return <Outlet />;
};

export default SellerProtectedRoute;
