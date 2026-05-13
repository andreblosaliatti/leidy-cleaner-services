import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { FormAlert } from '../../components/ui/FormAlert';
import { StateBox } from '../../components/ui/PageState';
import { useAuth } from '../../features/auth/useAuth';
import { isConviteAtivo } from '../../features/profissional/convites/conviteLabels';
import { listarMeusConvites } from '../../features/profissional/convites/convitesApi';
import { ApiError, getApiErrorMessage } from '../../services/apiClient';
import { ProfessionalMobileConviteSummaryCard } from './ProfessionalMobileConviteSummaryCard';

const queryKeys = {
  convites: ['profissional', 'convites', 'mobile'],
};

export function ProfessionalMobileConvitesPage() {
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
    <div className="grid gap-4">
      <section className="rounded-[1.75rem] border border-cyan-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Convites</p>
        <h2 className="mt-3 text-2xl font-black text-slate-900">Convites recebidos</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Consulte os convites enviados para voce em uma experiencia mobile mais direta. Nesta etapa, a tela mostra status, prazo, valor estimado e acesso ao detalhe.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <button
          className={[
            'min-h-12 rounded-[1.25rem] px-4 text-sm font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700',
            selectedTab === 'ativos' ? 'bg-cyan-700 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
          ].join(' ')}
          type="button"
          onClick={() => setSelectedTab('ativos')}
        >
          Ativos
        </button>
        <button
          className={[
            'min-h-12 rounded-[1.25rem] px-4 text-sm font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700',
            selectedTab === 'historico' ? 'bg-cyan-700 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
          ].join(' ')}
          type="button"
          onClick={() => setSelectedTab('historico')}
        >
          Historico
        </button>
      </div>

      {convitesQuery.isLoading && (
        <StateBox tone="loading" title="Carregando convites" description="Buscando seus convites recebidos." className="rounded-[1.75rem]" />
      )}

      {convitesQuery.isError && !protectedError && (
        <FormAlert
          tone="error"
          title="Nao foi possivel carregar convites"
          message={getApiErrorMessage(convitesQuery.error)}
          details={convitesQuery.error instanceof ApiError ? convitesQuery.error.errors : []}
        />
      )}

      {convitesQuery.isSuccess && selectedTab === 'ativos' && convitesVisiveis.length === 0 && (
        <StateBox
          tone="empty"
          title="Nenhum convite pendente"
          description="Quando houver convite aguardando resposta, ele aparecera aqui com status, prazo e valor estimado."
          className="rounded-[1.75rem]"
        />
      )}

      {convitesQuery.isSuccess && selectedTab === 'historico' && convitesVisiveis.length === 0 && (
        <StateBox
          tone="empty"
          title="Nenhum convite no historico"
          description="Convites expirados, aceitos, recusados ou cancelados aparecerao nesta aba."
          className="rounded-[1.75rem]"
        />
      )}

      {convitesVisiveis.length > 0 && (
        <div className="grid gap-3">
          {convitesVisiveis.map((convite) => (
            <ProfessionalMobileConviteSummaryCard key={convite.conviteId} convite={convite} />
          ))}
        </div>
      )}
    </div>
  );
}

function requireToken(token: string | null) {
  if (!token) {
    throw new ApiError({
      status: 401,
      code: 'UNAUTHENTICATED',
      message: 'Sessao expirada. Entre novamente.',
    });
  }

  return token;
}
