import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { getDashboardPath } from '../features/auth/session';
import { useAuth } from '../features/auth/useAuth';
import {
  buildProfessionalAppOnlyLoginPath,
  isNativeProfessionalApp,
  isProfessionalAppUser,
} from '../features/native/professionalApp';

export function RequireProfessionalAppProfile() {
  const { status, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (status !== 'authenticated' || !user || isProfessionalAppUser(user) || !isNativeProfessionalApp()) {
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

  if (status === 'loading') {
    return <FullPageLoading label="Validando acesso ao app profissional..." />;
  }

  if (!user) {
    const redirectTo = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/entrar?redirectTo=${redirectTo}`} replace />;
  }

  if (!isProfessionalAppUser(user)) {
    if (isNativeProfessionalApp()) {
      return <FullPageLoading label="Validando acesso ao app profissional..." />;
    }

    return <Navigate to={getDashboardPath(user)} replace />;
  }

  return <Outlet />;
}

function FullPageLoading({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f7f4] px-5">
      <div className="rounded-lg border border-cyan-100 bg-white px-6 py-5 text-sm font-semibold text-slate-700 shadow-sm">
        {label}
      </div>
    </div>
  );
}
