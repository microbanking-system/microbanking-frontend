import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('token');

  // If no token exists, redirect to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Basic JWT expiry check
  try {
    const payload = JSON.parse(atob(token.split('.')[1] || '')) as { exp?: number };
    if (payload?.exp && Date.now() >= payload.exp * 1000) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/" replace />;
    }
  } catch (_) {
    // If token is malformed, treat as unauthenticated
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;