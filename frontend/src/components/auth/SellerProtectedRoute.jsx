import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * SellerProtectedRoute — Guards all routes under /seller
 * 
 * Access rules:
 *   loading          → show spinner (prevents flash-redirect on page refresh)
 *   not logged in    → redirect to /login
 *   is_superuser     → redirect to /admin (superusers have their own dashboard)
 *   is_staff=True    → grant access (Seller)
 *   regular customer → redirect to /dashboard
 */
const SellerProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for session restoration before making routing decisions
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 gap-3">
        <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        <span className="text-sm text-slate-400 font-medium">Verifying seller access…</span>
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

  // Must be a seller (is_staff=True)
  if (!user.is_staff) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default SellerProtectedRoute;
