import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { BrandMark } from '../components/public/BrandMark';
import { getFirstName, getProfileLabel, isAdminUser } from '../features/auth/session';
import type { TipoUsuario } from '../features/auth/types';
import { useAuth } from '../features/auth/useAuth';

type NavigationItem = {
  label: string;
  href: string;
};

const navigationByProfile: Record<TipoUsuario, NavigationItem[]> = {
  CLIENTE: [
    { label: 'Resumo', href: '/app/cliente' },
    { label: 'Meus endereços', href: '/app/cliente/enderecos' },
    { label: 'Minhas solicitações', href: '/app/cliente/solicitacoes' },
    { label: 'Pagamentos', href: '/app/cliente/pagamentos' },
    { label: 'Atendimentos', href: '/app/cliente/atendimentos' },
    { label: 'Ocorrências', href: '/app/ocorrencias' },
  ],
  PROFISSIONAL: [
    { label: 'Resumo', href: '/app/profissional' },
    { label: 'Meu perfil', href: '/app/profissional/perfil' },
    { label: 'Regiões', href: '/app/profissional/regioes' },
    { label: 'Disponibilidade', href: '/app/profissional/disponibilidade' },
    { label: 'Verificações', href: '/app/profissional/verificacoes' },
    { label: 'Convites', href: '/app/profissional/convites' },
    { label: 'Atendimentos', href: '/app/profissional/atendimentos' },
    { label: 'Ocorrências', href: '/app/ocorrencias' },
  ],
  ADMIN: [
    { label: 'Resumo', href: '/app/admin' },
    { label: 'Verificações', href: '/app/admin/verificacoes' },
    { label: 'Profissionais', href: '/app/admin/profissionais' },
    { label: 'Usuários', href: '/app/admin/usuarios' },
    { label: 'Solicitações', href: '/app/admin/solicitacoes' },
    { label: 'Atendimentos', href: '/app/admin/atendimentos' },
    { label: 'Pagamentos', href: '/app/admin/pagamentos' },
    { label: 'Preços', href: '/app/admin/configuracoes/precos' },
    { label: 'Ocorrências', href: '/app/admin/ocorrencias' },
  ],
};

export function AuthenticatedLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const profile = isAdminUser(user) ? 'ADMIN' : user.tipoUsuario;
  const navigationItems = navigationByProfile[profile];
  const greetingName = getFirstName(user.nomeCompleto) || getProfileLabel(profile);

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-[#f6f7f4] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl min-w-0 items-center justify-between gap-4 px-5 py-4 md:px-8">
          <BrandMark compact />
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-sm font-black text-slate-900">{user.nomeCompleto}</p>
              <p className="text-xs font-semibold text-slate-500">{getProfileLabel(profile)}</p>
            </div>
            <button
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
              type="button"
              onClick={handleLogout}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl min-w-0 gap-5 px-5 py-5 md:grid-cols-[260px_minmax(0,1fr)] md:px-8 md:py-8">
        <aside className="min-w-0 self-start rounded-lg border border-slate-100 bg-white p-3 shadow-sm md:sticky md:top-24">
          <div className="px-3 py-3">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-green-700">Área {getProfileLabel(profile)}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Olá, {greetingName}.</p>
          </div>
          <nav className="mt-2 grid gap-1 sm:grid-cols-2 md:grid-cols-1" aria-label="Navegação autenticada">
            {navigationItems.map((item) => (
              <NavLink
                key={item.label}
                className={({ isActive }) =>
                  [
                    'flex min-h-11 items-center rounded-lg px-3 py-3 text-sm font-bold transition',
                    isActive ? 'bg-green-50 text-green-700' : 'text-slate-700 hover:bg-slate-50 hover:text-green-700',
                  ].join(' ')
                }
                end={item.href === '/app/cliente' || item.href === '/app/profissional' || item.href === '/app/admin'}
                to={item.href}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            className="mt-3 flex min-h-11 w-full items-center rounded-lg border border-green-100 px-3 py-3 text-left text-sm font-bold text-green-700 transition hover:bg-green-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
            type="button"
            onClick={handleLogout}
          >
            Ver página pública
          </button>
        </aside>

        <main className="w-full min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
