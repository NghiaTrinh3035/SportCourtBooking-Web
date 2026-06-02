import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '../../entities/user/types';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
