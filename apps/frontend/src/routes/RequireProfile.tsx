import { Navigate, Outlet } from 'react-router-dom';

import { canAccessProfile, getDashboardPath } from '../features/auth/session';
import type { TipoUsuario } from '../features/auth/types';
import { useAuth } from '../features/auth/useAuth';

export function RequireProfile({ profile }: { profile: TipoUsuario }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/entrar" replace />;
  }

  if (!canAccessProfile(user, profile)) {
    return <Navigate to={getDashboardPath(user)} replace />;
  }

  return <Outlet />;
}
