import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  // Get auth state from Redux store
  const { isAuthenticated, token, user } = useSelector((state) => state.auth);
  
  // Also check localStorage as backup
  const localToken = localStorage.getItem('token');
  const localUser = localStorage.getItem('user');
  
  // Debug logs
  console.log('ProtectedRoute Check:', {
    isAuthenticated,
    reduxToken: token,
    localToken,
    reduxUser: user,
    localUser: localUser ? JSON.parse(localUser) : null,
    currentPath: location.pathname
  });
  
  // Check authentication from both Redux store and localStorage
  const isUserAuthenticated = isAuthenticated || (localToken && localUser);
  
  if (!isUserAuthenticated) {
    console.log('User not authenticated, redirecting to signin');
    // Redirect to login page with return url
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  
  console.log('User authenticated, rendering protected component');
  return children;
};

export default ProtectedRoute;