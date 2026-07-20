import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { FormAlert } from '../../components/ui/FormAlert';
import { StateBox } from '../../components/ui/PageState';
import { useAuth } from '../../features/auth/useAuth';
import { finalizarAtendimento, iniciarAtendimento, listarMeusAtendimentos } from '../../features/atendimentos/atendimentosApi';
import type { AtendimentoVisivel } from '../../features/atendimentos/types';
import { ApiError, getApiErrorMessage } from '../../services/apiClient';
import { ProfessionalMobileAtendimentoSummaryCard } from './ProfessionalMobileAtendimentoSummaryCard';
import {
  buildAttendanceErrorMessage,
  buildAttendanceErrorTitle,
  buildAttendanceSuccessFeedback,
  professionalMobileQueryKeys,
  refreshProfessionalMobileAttendanceQueries,
  requireProfessionalMobileToken,
  shouldRefreshAttendanceAfterActionError,
  type AttendanceAction,
  type MobileFeedback,
} from './professionalMobileActions';

type AttendanceTab = 'confirmados' | 'em_execucao' | 'historico';

export function ProfessionalMobileAtendimentosPage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<AttendanceTab>('confirmados');
  const [feedback, setFeedback] = useState<MobileFeedback | null>(null);
  const [pendingAction, setPendingAction] = useState<{ atendimentoId: number; action: AttendanceAction } | null>(null);

  const atendimentosQuery = useQuery({
    queryKey: professionalMobileQueryKeys.atendimentos,
    queryFn: () => listarMeusAtendimentos(requireProfessionalMobileToken(token)),
    enabled: Boolean(token),
  });

  const protectedError = useMemo(
    () => (atendimentosQuery.error instanceof ApiError && atendimentosQuery.error.status === 401 ? atendimentosQuery.error : null),
    [atendimentosQuery.error],
  );

  useEffect(() => {
    if (protectedError) {
      logout();
      navigate('/entrar', { replace: true });
    }
  }, [logout, navigate, protectedError]);

  const attendanceActionMutation = useMutation({
    mutationFn: ({ atendimentoId, action }: { atendimentoId: number; action: AttendanceAction }) => {
      const activeToken = requireProfessionalMobileToken(token);
      return action === 'iniciar'
        ? iniciarAtendimento(activeToken, atendimentoId, {})
        : finalizarAtendimento(activeToken, atendimentoId, {});
    },
    onMutate: ({ atendimentoId, action }) => {
      setPendingAction({ atendimentoId, action });
      setFeedback(null);
    },
    onSuccess: async (_, { atendimentoId, action }) => {
      await refreshProfessionalMobileAttendanceQueries(queryClient, atendimentoId);
      setFeedback(buildAttendanceSuccessFeedback(action));
    },
    onError: async (error, { atendimentoId, action }) => {
      if (error instanceof ApiError && error.status === 401) {
        logout();
        navigate('/entrar', { replace: true });
        return;
      }

      if (shouldRefreshAttendanceAfterActionError(error)) {
        await refreshProfessionalMobileAttendanceQueries(queryClient, atendimentoId);
      }

      setFeedback({
        tone: 'error',
        title: buildAttendanceErrorTitle(error, action),
        message: buildAttendanceErrorMessage(error, action),
        details: error instanceof ApiError ? error.errors : [],
      });
    },
    onSettled: () => {
      setPendingAction(null);
    },
  });

  const atendimentos = atendimentosQuery.data ?? [];
  const confirmados = sortAtendimentos(
    atendimentos.filter((atendimento) => atendimento.status === 'CONFIRMADO' || atendimento.status === 'AGUARDANDO_PAGAMENTO'),
  );
  const emExecucao = sortAtendimentos(atendimentos.filter((atendimento) => atendimento.status === 'EM_EXECUCAO'));
  const historico = sortAtendimentos(
    atendimentos.filter(
      (atendimento) =>
        atendimento.status === 'FINALIZADO' || atendimento.status === 'CANCELADO' || atendimento.status === 'EM_ANALISE',
    ),
  );

  const visibleAtendimentos =
    selectedTab === 'confirmados' ? confirmados : selectedTab === 'em_execucao' ? emExecucao : historico;

  return (
    <div className="grid gap-4">
      <section className="rounded-[1.75rem] border border-cyan-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Atendimentos</p>
        <h2 className="mt-3 text-2xl font-black text-slate-900">Atendimentos da profissional</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Acompanhe seus servicos confirmados, em andamento e finalizados em uma visualizacao mobile dedicada.
        </p>
      </section>

      {feedback && <FormAlert tone={feedback.tone} title={feedback.title} message={feedback.message} details={feedback.details} />}

      <div className="grid grid-cols-3 gap-3">
        <TabButton
          count={confirmados.length}
          isActive={selectedTab === 'confirmados'}
          label="Confirmados"
          onClick={() => setSelectedTab('confirmados')}
        />
        <TabButton
          count={emExecucao.length}
          isActive={selectedTab === 'em_execucao'}
          label="Em andamento"
          onClick={() => setSelectedTab('em_execucao')}
        />
        <TabButton count={historico.length} isActive={selectedTab === 'historico'} label="Historico" onClick={() => setSelectedTab('historico')} />
      </div>

      {atendimentosQuery.isLoading && (
        <StateBox
          tone="loading"
          title="Carregando atendimentos"
          description="Buscando seus atendimentos vinculados."
          className="rounded-[1.75rem]"
        />
      )}

      {atendimentosQuery.isError && !protectedError && (
        <FormAlert
          tone="error"
          title="Nao foi possivel carregar atendimentos"
          message={getApiErrorMessage(atendimentosQuery.error)}
          details={atendimentosQuery.error instanceof ApiError ? atendimentosQuery.error.errors : []}
        />
      )}

      {atendimentosQuery.isSuccess && atendimentos.length === 0 && (
        <StateBox
          tone="empty"
          title="Nenhum atendimento encontrado"
          description="Quando um convite for aceito e o atendimento for criado pelo sistema, ele aparecera aqui."
          className="rounded-[1.75rem]"
        />
      )}

      {atendimentosQuery.isSuccess && atendimentos.length > 0 && visibleAtendimentos.length === 0 && (
        <StateBox
          tone="empty"
          title={getEmptyTitle(selectedTab)}
          description={getEmptyDescription(selectedTab)}
          className="rounded-[1.75rem]"
        />
      )}

      {visibleAtendimentos.length > 0 && (
        <div className="grid gap-3">
          {visibleAtendimentos.map((atendimento) => (
            <ProfessionalMobileAtendimentoSummaryCard
              key={atendimento.id}
              atendimento={atendimento}
              isActionDisabled={attendanceActionMutation.isPending}
              pendingAction={
                pendingAction?.atendimentoId === atendimento.id && attendanceActionMutation.isPending ? pendingAction.action : null
              }
              onQuickAction={(selectedAtendimento, action) => {
                if (attendanceActionMutation.isPending) {
                  return;
                }

                if (action === 'finalizar' && typeof window !== 'undefined') {
                  const confirmed = window.confirm('Confirmar a finalizacao deste atendimento?');

                  if (!confirmed) {
                    return;
                  }
                }

                attendanceActionMutation.mutate({ atendimentoId: selectedAtendimento.id, action });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TabButton({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={[
        'min-h-12 rounded-[1.25rem] px-3 text-center text-sm font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700',
        isActive ? 'bg-cyan-700 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
      ].join(' ')}
      type="button"
      onClick={onClick}
    >
      <span className="block">{label}</span>
      <span className={['mt-1 block text-[0.7rem] font-semibold', isActive ? 'text-cyan-100' : 'text-slate-500'].join(' ')}>
        {count}
      </span>
    </button>
  );
}

function sortAtendimentos(atendimentos: AtendimentoVisivel[]) {
  return [...atendimentos].sort((left, right) => {
    return new Date(left.inicioPrevistoEm).getTime() - new Date(right.inicioPrevistoEm).getTime();
  });
}

function getEmptyTitle(tab: AttendanceTab) {
  if (tab === 'confirmados') {
    return 'Nenhum atendimento confirmado';
  }

  if (tab === 'em_execucao') {
    return 'Nenhum atendimento em andamento';
  }

  return 'Nenhum atendimento no historico';
}

function getEmptyDescription(tab: AttendanceTab) {
  if (tab === 'confirmados') {
    return 'Os proximos atendimentos confirmados aparecerao aqui.';
  }

  if (tab === 'em_execucao') {
    return 'Quando houver um servico em execucao, ele ficara destacado nesta aba.';
  }

  return 'Atendimentos finalizados, cancelados ou em analise aparecerao aqui.';
}
