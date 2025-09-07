
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { selectCurrentToken } from '../../redux/slices/authSlice';

const ProtectedRoute = () => {
  const token = useSelector(selectCurrentToken);
  const location = useLocation();

  useEffect(() => {
    console.log('ProtectedRoute - Token:', token);
    console.log('ProtectedRoute - Current path:', location.pathname);
  }, [token, location.pathname]);

  if (!token) {
    // Redirect to login page with the return url
    console.log('No token found, redirecting to login');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
