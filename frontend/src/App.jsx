import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// 1. Import TanStack Query core providers
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Auth State System Imports
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { CartProvider } from './context/CartContext';

// Layout Shell Imports
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminProtectedRoute from './components/common/AdminProtectedRoute';



// Page Component Imports
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import DashboardOrders from './pages/DashboardOrders';
import DashboardAddress from './pages/DashboardAddress';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import CheckoutSuccess from './pages/CheckoutSuccess';
import OrderHistory from './pages/OrderHistory';
import ForgotPassword from './pages/ForgotPassword';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm';


// 2. Instantiate a global QueryClient configuration block
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Cache data for exactly 5 minutes before checking backend for updates
      gcTime: 1000 * 60 * 10,    // Keep unused data in memory garbage collection for 10 minutes
      retry: 1,                 // If a network request drops, retry it exactly 1 time before showing an error
      refetchOnWindowFocus: false, // Prevents aggressive automatic re-fetching when changing browser tabs
    },
  },
});

const AppRouter = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-400 tracking-wide animate-pulse">
          Establishing Secure Connection...
        </p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart/>} />
        <Route path="checkout-success" element={<CheckoutSuccess/>} /> 
        <Route path="order-history" element={<OrderHistory/>} />  
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPasswordConfirm />} />

        </Route>   

      {/* Customer Dashboard Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index          element={<CustomerDashboard />} />
        <Route path="orders"  element={<DashboardOrders />} />
        <Route path="address" element={<DashboardAddress />} />
      </Route>

      {/* Admin Routes — staff/superuser only */}
      <Route path="/admin" element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* Catch-All Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    // 3. Wrap entire application with the Query Client Provider framework
    <QueryClientProvider client={queryClient}>
      {/* Global toast notification renderer — sits outside the Router so it's always available */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            fontSize: '0.875rem',
            fontWeight: '500',
            borderRadius: '0.75rem',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
      <AuthProvider>
        <CartProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

