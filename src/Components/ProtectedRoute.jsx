import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.Role)) {
    return user.Role === 'Admin' 
      ? <Navigate to="/admin-dashboard" replace />
      : <Navigate to="/staff-dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;