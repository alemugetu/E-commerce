import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * PermissionProtectedRoute — guards routes that require specific Django permissions
 * 
 * Props:
 *   requiredPermissions: array of permission codenames (e.g. ['view_reports'])
 * 
 * Rules:
 *   - No active session → redirect to /login
 *   - Missing permissions → redirect to /operations
 */
const PermissionProtectedRoute = ({ children, requiredPermissions = [] }) => {
  const { user, permissions, loading } = useAuth();
  const location = useLocation();

  // Wait for auth to load
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 gap-3">
        <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Verifying permissions…</span>
      </div>
    );
  }

  // No active session → send to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has all required permissions
  const hasAllPermissions = requiredPermissions.every(perm => permissions.includes(perm));
  if (!hasAllPermissions) {
    return <Navigate to="/operations" replace />;
  }

  return children;
};

export default PermissionProtectedRoute;
