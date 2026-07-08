import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import our custom atomic UI components
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Where the user was trying to go before being bounced to /login.
  // Used only as a fallback for non-role-specific redirects.
  const from = location.state?.from?.pathname;

  /**
   * Determines the correct post-login destination based on role.
   *  - Superuser (is_superuser)       → /admin
   *  - Seller (is_staff, not superuser) → /seller
   *  - Customer                       → /dashboard (or their intended page)
   */
  const getRedirectPath = (loggedInUser) => {
    if (loggedInUser?.is_superuser) {
      return '/admin';
    }
    if (loggedInUser?.is_staff) {
      return '/seller';
    }
    // If the user was bounced from a customer-only page, send them back there.
    // But never send a regular user to /admin or /seller even if that was the "from" path.
    if (from && !from.startsWith('/admin') && !from.startsWith('/seller')) {
      return from;
    }
    return '/dashboard';
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
      // After login, the AuthContext updates the `user` state asynchronously.
      // We read the fresh user from the result if provided, otherwise fall back
      // to decoding the token ourselves via the context.
      // The login() function in AuthContext calls enrichUserFromProfile which
      // sets user state — but since setState is async, we decode from result.
      // We pass the decoded user stored in context after await completes.
      // Small trick: read the updated context user via a brief state settle.
      // Use result.user if your login() returns it, otherwise read from context.
      navigate(getRedirectPath(result.user ?? user), { replace: true });
    } else {
      setLocalError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 text-sm mt-2">Sign in to access your secure profile portal.</p>
        </div>

        {/* Global Error Alert Box */}
        {localError && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 font-medium text-center">
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
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer" 
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 cursor-pointer">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
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

        <div className="mt-8 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            Create an account
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;

