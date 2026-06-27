import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminProtectedRoute = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    // Manually decode the JWT token payload
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const userClaims = JSON.parse(window.atob(base64));

    // Strict validation check against your CustomUser model flags
    if (!userClaims.is_staff && !userClaims.is_superuser) {
      console.error("Access denied: Account lacks administrative privileges.");
      return <Navigate to="/" replace />;
    }

    return <Outlet />;
  } catch (error) {
    console.error("Invalid token format:", error);
    return <Navigate to="/login" replace />;
  }
};

export default AdminProtectedRoute;

