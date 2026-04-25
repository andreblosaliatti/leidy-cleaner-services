import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../features/auth/useAuth';

export function RequireAuth() {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <FullPageLoading label="Carregando sua sessão..." />;
  }

  if (!user) {
    const redirectTo = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/entrar?redirectTo=${redirectTo}`} replace />;
  }

  return <Outlet />;
}

function FullPageLoading({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f7f4] px-5">
      <div className="rounded-lg border border-green-100 bg-white px-6 py-5 text-sm font-semibold text-slate-700 shadow-sm">
        {label}
      </div>
    </div>
  );
}
