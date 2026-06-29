import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * AdminProtectedRoute
 *
 * Guards every route nested under /admin.
 * Relies exclusively on the AuthContext user state, which is hydrated from
 * the decoded JWT access token (including is_staff / is_superuser claims).
 *
 * Three states:
 *   loading  → show a neutral spinner (prevents flash-redirect on hard refresh)
 *   no user  → redirect to /login
 *   non-admin user → redirect to / (home)
 *   staff or superuser → render the child routes via <Outlet />
 */
const AdminProtectedRoute = () => {
  const { user, loading } = useAuth();

  // Wait for the auth context to finish restoring the session from the
  // refresh token before making any routing decision.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 gap-3">
        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
        <span className="text-sm text-slate-400 font-medium">Verifying admin access…</span>
      </div>
    );
  }

  // Not logged in at all
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not staff or superuser
  if (!user.is_staff && !user.is_superuser) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
