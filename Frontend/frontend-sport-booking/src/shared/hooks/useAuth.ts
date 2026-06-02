import { useMemo } from 'react';
import authService from '../../services/authService';

export const useAuth = () => {
  const user = authService.getCurrentUser();

  return useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      logout: authService.logout,
    }),
    [user],
  );
};
