import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/auth" />;
  }

  return children;
};

export default ProtectedRoute;
