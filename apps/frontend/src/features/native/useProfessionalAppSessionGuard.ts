import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/useAuth';
import {
  buildProfessionalAppOnlyLoginPath,
  isNativeProfessionalApp,
  isProfessionalAppUser,
} from './professionalApp';

export function useProfessionalAppSessionGuard() {
  const { status, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNativeProfessionalApp() || status !== 'authenticated' || !user || isProfessionalAppUser(user)) {
      return;
    }

    logout();
    navigate(buildProfessionalAppOnlyLoginPath(), {
      replace: true,
      state: {
        blockedPath: `${location.pathname}${location.search}`,
      },
    });
  }, [location.pathname, location.search, logout, navigate, status, user]);
}
