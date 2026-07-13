import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardRouteForGroups } from '../config/groupRoutes';

// Import our custom atomic UI components
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user, getDashboardRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Where the user was trying to go before being bounced to /login.
  // Used only as a fallback for non-role-specific redirects.
  const from = location.state?.from?.pathname;

  /**
   * Determines the correct post-login destination based on user's Django groups.
   *  - Superuser (is_superuser)       → /admin
   *  - User with operational groups    → /operations (unified dashboard)
   *  - Customer (no groups)           → /dashboard (or their intended page)
   */
  const getRedirectPath = (loggedInUser) => {
    // Use the new group-based routing with the fresh loggedInUser (not context's user which hasn't updated yet)
    const dashboardRoute = getDashboardRouteForGroups(loggedInUser?.groups || [], loggedInUser?.is_superuser || false);
    
    // If the user was bounced from a customer-only page, send them back there.
    // But never send a regular user to admin/seller/operations dashboards if that was the "from" path.
    if (from && !from.startsWith('/admin') && !from.startsWith('/seller') && 
        !from.startsWith('/operations') && !from.startsWith('/warehouse') && 
        !from.startsWith('/finance') && !from.startsWith('/marketing') && 
        !from.startsWith('/support') && !from.startsWith('/delivery') && 
        !from.startsWith('/content')) {
      return from;
    }
    
    return dashboardRoute || '/dashboard';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsSubmitting(true);

    // Basic frontend validation
    if (!email || !password) {
      setLocalError('Please fill in both email and password.');
      setIsSubmitting(false);
      return;
    }

    // Call the global context login method — returns { success, user?, error? }
    const result = await login(email, password);

    if (result.success) {
      // Always use the freshly decoded user from the login response.
      // The context user state updates asynchronously via setState, so we
      // rely on result.user which contains the decoded groups immediately.
      navigate(getRedirectPath(result.user), { replace: true });
    } else {
      setLocalError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Sign in to access your secure profile portal.</p>
        </div>

        {/* Global Error Alert Box */}
        {localError && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400 font-medium text-center">
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input 
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
          
          <Input 
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <input 
                id="remember-me" 
                name="remember-me" 
                type="checkbox" 
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 rounded cursor-pointer" 
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="/forgot-password" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                Forgot password?
              </a>
            </div>
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full mt-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
            Create an account
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;

