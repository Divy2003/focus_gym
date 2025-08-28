
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { selectCurrentToken } from '../../features/auth/authSlice';

const ProtectedRoute = () => {
  const token = useSelector(selectCurrentToken);

  return token ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;
