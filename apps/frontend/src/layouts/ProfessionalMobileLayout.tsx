import { useEffect, useId, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { BrandMark } from '../components/public/BrandMark';
import { FormAlert } from '../components/ui/FormAlert';
import { getFirstName } from '../features/auth/session';
import { useAuth } from '../features/auth/useAuth';
import {
  subscribeToForegroundPushEvents,
  type ProfessionalForegroundPushEvent,
} from '../features/notificacoes/pushNotificationRouting';
import { useProfessionalPushNotifications } from '../features/notificacoes/useProfessionalPushNotifications';

type MobileNavigationItem = {
  label: string;
  href: string;
};

const mobileNavigationItems: MobileNavigationItem[] = [
  { label: 'Início', href: '/profissional/app' },
  { label: 'Convites', href: '/profissional/app/convites' },
  { label: 'Atend.', href: '/profissional/app/atendimentos' },
];

const menuNavigationItems: MobileNavigationItem[] = [
  { label: 'Perfil', href: '/profissional/app/perfil' },
  { label: 'Agenda', href: '/profissional/app/disponibilidade' },
  { label: 'Regiões', href: '/profissional/app/regioes' },
  { label: 'Verificação', href: '/profissional/app/verificacao' },
  { label: 'Ocorrências', href: '/profissional/app/ocorrencias' },
  { label: 'Avaliações', href: '/profissional/app/avaliacoes' },
];

const titleByPath = [
  { matchPrefix: '/profissional/app/convites', title: 'Convites' },
  { matchPrefix: '/profissional/app/atendimentos', title: 'Atendimentos' },
  { matchPrefix: '/profissional/app/perfil', title: 'Perfil' },
  { matchPrefix: '/profissional/app/regioes', title: 'Regiões' },
  { matchPrefix: '/profissional/app/disponibilidade', title: 'Disponibilidade' },
  { matchPrefix: '/profissional/app/verificacao', title: 'Verificação' },
  { matchPrefix: '/profissional/app/ocorrencias', title: 'Ocorrências' },
  { matchPrefix: '/profissional/app/avaliacoes', title: 'Avaliações' },
];

export function ProfessionalMobileLayout() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [foregroundPushEvent, setForegroundPushEvent] = useState<ProfessionalForegroundPushEvent | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuId = useId();

  useProfessionalPushNotifications({
    enabled: user?.tipoUsuario === 'PROFISSIONAL',
    userId: user?.id ?? null,
    authToken: token,
  });

  useEffect(() => {
    const unsubscribe = subscribeToForegroundPushEvents((event) => {
      if (user?.tipoUsuario !== 'PROFISSIONAL') {
        return;
      }

      if (event.tipo === 'CONVITE_RECEBIDO' || event.conviteId) {
        void queryClient.invalidateQueries({ queryKey: ['profissional', 'convites'] });
      }

      if (event.atendimentoId) {
        void queryClient.invalidateQueries({ queryKey: ['atendimentos', 'meus', 'profissional'] });
        void queryClient.invalidateQueries({ queryKey: ['atendimentos', 'profissional'] });
      }

      setForegroundPushEvent(event);
    });

    return unsubscribe;
  }, [queryClient, user?.tipoUsuario]);

  useEffect(() => {
    if (!foregroundPushEvent) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setForegroundPushEvent(null);
    }, 8000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [foregroundPushEvent]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  if (!user) {
    return null;
  }

  const pageTitle = titleByPath.find((item) => location.pathname.startsWith(item.matchPrefix))?.title ?? 'Início';
  const firstName = getFirstName(user.nomeCompleto) || 'Profissional';
  const foregroundTargetPath = foregroundPushEvent?.targetPath ?? null;

  function handleLogout() {
    setIsMenuOpen(false);
    logout();
    navigate('/', { replace: true });
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#dff5f3_0%,#f4f7f3_34%,#f8faf8_100%)] text-slate-900 sm:px-4 sm:py-6">
      <div className="mx-auto flex min-h-screen max-w-[30rem] flex-col overflow-x-hidden bg-[#f8faf8] sm:min-h-[calc(100vh-3rem)] sm:overflow-hidden sm:rounded-[2rem] sm:border sm:border-white/80 sm:shadow-[0_32px_90px_-48px_rgba(15,23,42,0.45)]">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 pb-3 pt-[max(0.9rem,env(safe-area-inset-top))] backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <BrandMark compact />
              <p className="mt-3 text-[0.65rem] font-black uppercase tracking-[0.14em] text-cyan-700">App profissional</p>
              <h1 className="mt-1.5 text-[1.45rem] font-black leading-tight text-slate-900">{pageTitle}</h1>
              <p className="mt-1 text-xs leading-5 text-slate-600">Olá, {firstName}. Acompanhe sua rotina profissional por aqui.</p>
            </div>

            <div className="relative shrink-0">
              <button
                aria-controls={menuId}
                aria-expanded={isMenuOpen}
                aria-label="Abrir menu"
                className={[
                  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl border bg-white px-3 text-slate-700 transition',
                  isMenuOpen ? 'border-cyan-200 text-cyan-700' : 'border-slate-200 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700',
                ].join(' ')}
                type="button"
                onClick={() => setIsMenuOpen((current) => !current)}
              >
                <span className="sr-only">Abrir menu</span>
                <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {isMenuOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+0.6rem)] z-40 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.45)]"
                  id={menuId}
                  role="menu"
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-slate-500">Mais opções</p>
                  </div>

                  <div className="grid p-2">
                    {menuNavigationItems.map((item) => {
                      const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);

                      return (
                        <NavLink
                          key={item.href}
                          className={[
                            'flex min-h-11 items-center rounded-[1rem] px-3 text-sm font-black transition',
                            isActive ? 'bg-cyan-700 text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-cyan-700',
                          ].join(' ')}
                          role="menuitem"
                          to={item.href}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <span className="min-w-0 truncate">{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-100 p-2">
                    <button
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-[1rem] border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                      type="button"
                      onClick={handleLogout}
                    >
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden px-4 pb-[calc(6.25rem+env(safe-area-inset-bottom))] pt-3">
          {foregroundPushEvent && (
            <div className="mb-4 grid gap-3">
              <FormAlert
                tone="info"
                title={foregroundPushEvent.title}
                message={foregroundPushEvent.body}
              />
              {foregroundTargetPath && (
                <button
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 px-4 text-sm font-black text-cyan-800 transition hover:bg-cyan-100"
                  type="button"
                  onClick={() => {
                    setForegroundPushEvent(null);
                    navigate(foregroundTargetPath);
                  }}
                >
                  Abrir agora
                </button>
              )}
            </div>
          )}
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[30rem] px-2 pb-[calc(0.45rem+env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-3 gap-1 rounded-[1.5rem] border border-slate-200 bg-white/96 p-1.5 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.55)] backdrop-blur">
          {mobileNavigationItems.map((item) => (
            <NavLink
              key={item.href}
              className={({ isActive }) =>
                [
                  'flex min-h-[2.35rem] min-w-0 flex-col items-center justify-center overflow-hidden rounded-xl px-1 text-center text-[0.62rem] font-black leading-tight transition',
                  isActive || (item.href === '/profissional/app' && location.pathname === '/profissional/app')
                    ? 'bg-cyan-700 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-cyan-700',
                ].join(' ')
              }
              end={item.href === '/profissional/app'}
              to={item.href}
            >
              <span className="block min-w-0 max-w-full truncate whitespace-nowrap">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
