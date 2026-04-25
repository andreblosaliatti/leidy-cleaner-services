import { Navigate } from 'react-router-dom';

import { getDashboardPath } from '../features/auth/session';
import { useAuth } from '../features/auth/useAuth';

export function AppHomeRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/entrar" replace />;
  }

  return <Navigate to={getDashboardPath(user)} replace />;
}
