import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Shield, Mail, LogOut } from 'lucide-react';

/**
 * AccessDenied — Professional access denied page for unauthorized dashboard access
 * 
 * Displayed when:
 * - User authenticates successfully but lacks dashboard permissions
 * - User tries to access a dashboard they don't have permission for
 * - User belongs to unknown/unconfigured groups
 * 
 * Features:
 * - Clear explanation of access denial
 * - Contact administrator instructions
 * - Logout option
 * - Professional UI consistent with application design
 */
const AccessDenied = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-2xl">
          
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-amber-500" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              You don't have permission to access this dashboard
            </p>
          </div>

          {/* Explanation */}
          <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-amber-700 dark:text-amber-200 font-medium mb-1">
                  No Assigned Dashboard
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Your account is authenticated but does not yet have an assigned role or dashboard access. 
                  This could be because:
                </p>
                <ul className="text-slate-600 dark:text-slate-400 text-xs mt-2 space-y-1 list-disc list-inside">
                  <li>Your account is still being configured</li>
                  <li>Required permissions haven't been assigned</li>
                  <li>Your role assignment is pending approval</li>
                </ul>
              </div>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-6">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Account Information</p>
              <div className="space-y-1">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">Email:</span> {user.email}
                </p>
                {user.groups && user.groups.length > 0 && (
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="text-slate-500 dark:text-slate-400">Groups:</span> {user.groups.join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
            
            <a
              href="/"
              className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-3 px-4 rounded-xl transition-colors"
            >
              Return to Home
            </a>
          </div>

          {/* Contact Support */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
              <Mail className="w-4 h-4" />
              <span>
                Need help? Contact your{' '}
                <a href="mailto:support@example.com" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
                  system administrator
                </a>
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 dark:text-slate-400 text-xs mt-6">
          If you believe this is an error, please contact your system administrator
        </p>
      </div>
    </div>
  );
};

export default AccessDenied;
