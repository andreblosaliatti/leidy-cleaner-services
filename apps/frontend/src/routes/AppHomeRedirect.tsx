import { Navigate } from 'react-router-dom';

import { useAuth } from '../features/auth/useAuth';
import {
  buildProfessionalAppOnlyLoginPath,
  getPreferredAuthenticatedPath,
  isNativeProfessionalApp,
  isProfessionalAppUser,
} from '../features/native/professionalApp';

export function AppHomeRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/entrar" replace />;
  }

  if (isNativeProfessionalApp() && !isProfessionalAppUser(user)) {
    return <Navigate to={buildProfessionalAppOnlyLoginPath()} replace />;
  }

  return <Navigate to={getPreferredAuthenticatedPath(user)} replace />;
}
