import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { FormAlert } from '../../components/ui/FormAlert';
import { StateBox } from '../../components/ui/PageState';
import { useAuth } from '../../features/auth/useAuth';
import { isConviteAtivo } from '../../features/profissional/convites/conviteLabels';
import { ConviteCard } from '../../features/profissional/convites/ConviteCard';
import { listarMeusConvites } from '../../features/profissional/convites/convitesApi';
import { ApiError, getApiErrorMessage } from '../../services/apiClient';

const queryKeys = {
  convites: ['profissional', 'convites'],
};

export function ProfissionalConvitesPage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'ativos' | 'historico'>('ativos');

  const convitesQuery = useQuery({
    queryKey: queryKeys.convites,
    queryFn: () => listarMeusConvites(requireToken(token)),
    enabled: Boolean(token),
  });

  const protectedError = useMemo(
    () => (convitesQuery.error instanceof ApiError && convitesQuery.error.status === 401 ? convitesQuery.error : null),
    [convitesQuery.error],
  );

  useEffect(() => {
    if (protectedError) {
      logout();
      navigate('/entrar', { replace: true });
    }
  }, [logout, navigate, protectedError]);

  const convites = convitesQuery.data ?? [];
  const convitesAtivos = convites.filter(isConviteAtivo);
  const convitesHistorico = convites.filter((convite) => !isConviteAtivo(convite));
  const convitesVisiveis = selectedTab === 'ativos' ? convitesAtivos : convitesHistorico;

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-cyan-100 bg-white p-5 shadow-sm md:p-7">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Profissional</p>
        <h1 className="mt-3 text-3xl font-black tracking-normal text-slate-900 md:text-4xl">Convites recebidos</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          Acompanhe os convites de solicitações enviados para você e responda dentro do prazo indicado.
        </p>
      </section>

      <section className="grid gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Meus convites</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Abra um convite para ver os dados completos antes de aceitar ou recusar.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className={[
              'min-h-10 rounded-lg px-4 text-sm font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700',
              selectedTab === 'ativos' ? 'bg-cyan-700 text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-50',
            ].join(' ')}
            type="button"
            onClick={() => setSelectedTab('ativos')}
          >
            Ativos
          </button>
          <button
            className={[
              'min-h-10 rounded-lg px-4 text-sm font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700',
              selectedTab === 'historico' ? 'bg-cyan-700 text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-50',
            ].join(' ')}
            type="button"
            onClick={() => setSelectedTab('historico')}
          >
            Historico
          </button>
        </div>

        {convitesQuery.isLoading && <StateBox tone="loading" title="Carregando convites" description="Buscando seus convites recebidos." />}

        {convitesQuery.isError && !protectedError && (
          <FormAlert
            tone="error"
            title="Não foi possível carregar convites"
            message={getApiErrorMessage(convitesQuery.error)}
            details={convitesQuery.error instanceof ApiError ? convitesQuery.error.errors : []}
          />
        )}

        {convitesQuery.isSuccess && selectedTab === 'ativos' && convitesVisiveis.length === 0 && (
          <StateBox tone="empty" title="Nenhum convite recebido" description="Quando uma solicitação for enviada para você, ela aparecerá aqui." />
        )}

        {convitesQuery.isSuccess && selectedTab === 'historico' && convitesVisiveis.length === 0 && (
          <StateBox
            tone="empty"
            title="Nenhum convite no historico"
            description="Convites expirados, recusados, aceitos ou cancelados aparecerao aqui."
          />
        )}

        {convitesVisiveis.length > 0 && (
          <div className="grid gap-4">
            {convitesVisiveis.map((convite) => (
              <ConviteCard key={convite.conviteId} convite={convite} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}


function requireToken(token: string | null) {
  if (!token) {
    throw new ApiError({
      status: 401,
      code: 'UNAUTHENTICATED',
      message: 'Sessão expirada. Entre novamente.',
    });
  }

  return token;
}
