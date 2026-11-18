import React from 'react';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If tenant owner has not completed onboarding, force them back to onboarding
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user.role === 'owner' && user.isOnboardingCompleted === false) {
        return <Navigate to="/onboarding" replace />;
      }
    } catch (e) {}
  }

  return children;
};

export default ProtectedRoute;

