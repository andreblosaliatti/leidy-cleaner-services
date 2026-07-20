import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { FormAlert } from '../../components/ui/FormAlert';
import { StateBox } from '../../components/ui/PageState';
import {
  getAtendimentoClienteLabel,
  getAtendimentoEnderecoLabel,
  getAtendimentoRegiaoLabel,
} from '../../features/atendimentos/atendimentoDisplay';
import {
  buscarAtendimento,
  finalizarAtendimento,
  iniciarAtendimento,
  listarCheckpointsAtendimento,
} from '../../features/atendimentos/atendimentosApi';
import { canFinishAtendimento, canStartAtendimento, formatCurrency, formatDateTime, getTipoServicoAtendimentoLabel } from '../../features/atendimentos/atendimentoLabels';
import { AtendimentoStatusBadge } from '../../features/atendimentos/AtendimentoStatusBadge';
import { CheckpointActionForm } from '../../features/atendimentos/CheckpointActionForm';
import { CheckpointsList } from '../../features/atendimentos/CheckpointsList';
import type { AtendimentoVisivel, CheckpointServicoRequest } from '../../features/atendimentos/types';
import { useAuth } from '../../features/auth/useAuth';
import { ApiError, getApiErrorMessage } from '../../services/apiClient';
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

export function ProfessionalMobileAtendimentoDetalhePage() {
  const { id } = useParams();
  const atendimentoId = Number(id);
  const validId = Number.isFinite(atendimentoId) && atendimentoId > 0;
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<MobileFeedback | null>(null);

  const atendimentoQuery = useQuery({
    queryKey: validId ? professionalMobileQueryKeys.atendimentoDetalhe(atendimentoId) : ['atendimentos', 'profissional', 'mobile', 'invalid'],
    queryFn: () => buscarAtendimento(requireProfessionalMobileToken(token), atendimentoId),
    enabled: Boolean(token && validId),
  });

  const checkpointsQuery = useQuery({
    queryKey: validId
      ? professionalMobileQueryKeys.atendimentoCheckpoints(atendimentoId)
      : ['atendimentos', 'profissional', 'mobile', 'invalid', 'checkpoints'],
    queryFn: () => listarCheckpointsAtendimento(requireProfessionalMobileToken(token), atendimentoId),
    enabled: Boolean(token && validId),
  });

  const protectedError = useMemo(
    () =>
      [atendimentoQuery.error, checkpointsQuery.error].find((error) => error instanceof ApiError && error.status === 401) ?? null,
    [atendimentoQuery.error, checkpointsQuery.error],
  );

  const startMutation = useMutation({
    mutationFn: (payload: CheckpointServicoRequest) => iniciarAtendimento(requireProfessionalMobileToken(token), atendimentoId, payload),
    onMutate: () => {
      setFeedback(null);
    },
    onSuccess: async () => {
      await refreshProfessionalMobileAttendanceQueries(queryClient, atendimentoId);
      setFeedback(buildAttendanceSuccessFeedback('iniciar'));
    },
    onError: (error) => {
      handleActionError({
        error,
        action: 'iniciar',
        atendimentoId,
        logout,
        navigate,
        queryClient,
        refetchAtendimento: atendimentoQuery.refetch,
        refetchCheckpoints: checkpointsQuery.refetch,
        setFeedback,
      });
    },
  });

  const finishMutation = useMutation({
    mutationFn: (payload: CheckpointServicoRequest) => finalizarAtendimento(requireProfessionalMobileToken(token), atendimentoId, payload),
    onMutate: () => {
      setFeedback(null);
    },
    onSuccess: async () => {
      await refreshProfessionalMobileAttendanceQueries(queryClient, atendimentoId);
      setFeedback(buildAttendanceSuccessFeedback('finalizar'));
    },
    onError: (error) => {
      handleActionError({
        error,
        action: 'finalizar',
        atendimentoId,
        logout,
        navigate,
        queryClient,
        refetchAtendimento: atendimentoQuery.refetch,
        refetchCheckpoints: checkpointsQuery.refetch,
        setFeedback,
      });
    },
  });

  useEffect(() => {
    if (protectedError) {
      logout();
      navigate('/entrar', { replace: true });
    }
  }, [logout, navigate, protectedError]);

  if (!validId) {
    return (
      <div className="grid gap-4">
        <FormAlert tone="error" title="Atendimento invalido" message="O identificador informado para este atendimento nao e valido." />
        <MobileBackLink />
      </div>
    );
  }

  const atendimento = atendimentoQuery.data;
  const actionPending = startMutation.isPending || finishMutation.isPending;
  const atendimentoCanceladoSemExecucao = atendimento?.status === 'CANCELADO' && !atendimento.inicioRealEm && !atendimento.fimRealEm;

  return (
    <div className="grid gap-4">
      <section className="rounded-[1.75rem] border border-cyan-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Atendimento</p>
        <h2 className="mt-3 text-2xl font-black text-slate-900">Detalhe do atendimento</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Consulte os dados do servico, os horarios registrados e os checkpoints ja enviados pelo sistema.
        </p>
      </section>

      {feedback && <FormAlert tone={feedback.tone} title={feedback.title} message={feedback.message} details={feedback.details} />}

      {atendimentoQuery.isLoading && (
        <StateBox
          tone="loading"
          title="Carregando atendimento"
          description="Buscando os dados completos deste atendimento."
          className="rounded-[1.75rem]"
        />
      )}

      {atendimentoQuery.isError && !protectedError && (
        <FormAlert
          tone="error"
          title="Nao foi possivel carregar o atendimento"
          message={getApiErrorMessage(atendimentoQuery.error)}
          details={atendimentoQuery.error instanceof ApiError ? atendimentoQuery.error.errors : []}
        />
      )}

      {atendimento && <ProfessionalMobileAtendimentoDetailCard atendimento={atendimento} />}

      {atendimentoCanceladoSemExecucao && (
        <FormAlert tone="info" message="Atendimento cancelado. Nao ha acao operacional disponivel para este servico." />
      )}

      {atendimento && !atendimentoCanceladoSemExecucao && (
        <section className="grid gap-3">
          {canStartAtendimento(atendimento.status) && (
            <CheckpointActionForm actionLabel="Iniciar servico" isSubmitting={actionPending} onSubmit={handleStart} />
          )}

          {canFinishAtendimento(atendimento.status) && (
            <CheckpointActionForm
              actionLabel="Finalizar servico"
              isSubmitting={actionPending}
              tone="finish"
              onSubmit={handleFinish}
            />
          )}

          {!canStartAtendimento(atendimento.status) && !canFinishAtendimento(atendimento.status) && (
            <FormAlert tone="info" message="Este atendimento nao esta disponivel para iniciar ou finalizar agora." />
          )}

          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-cyan-100 bg-white px-4 text-sm font-black text-cyan-700 transition hover:bg-cyan-50"
            to={`/profissional/app/ocorrencias/nova?atendimentoId=${atendimento.id}`}
          >
            Abrir ocorrencia deste atendimento
          </Link>
        </section>
      )}

      {atendimento && (
        <section className="grid gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-900">Checkpoints</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Veja os registros de inicio e fim disponiveis para este atendimento.</p>
          </div>

          {checkpointsQuery.isLoading && (
            <StateBox
              tone="loading"
              title="Carregando checkpoints"
              description="Buscando os registros do atendimento."
              className="rounded-[1.75rem]"
            />
          )}

          {checkpointsQuery.isError && !protectedError && (
            <FormAlert
              tone="error"
              title="Nao foi possivel carregar checkpoints"
              message={getApiErrorMessage(checkpointsQuery.error)}
              details={checkpointsQuery.error instanceof ApiError ? checkpointsQuery.error.errors : []}
            />
          )}

          {checkpointsQuery.data && <CheckpointsList checkpoints={checkpointsQuery.data} />}
        </section>
      )}

      <MobileBackLink />
    </div>
  );

  function handleStart(payload: CheckpointServicoRequest) {
    if (actionPending) {
      return;
    }

    setFeedback(null);
    startMutation.mutate(payload);
  }

  function handleFinish(payload: CheckpointServicoRequest) {
    if (actionPending) {
      return;
    }

    setFeedback(null);
    finishMutation.mutate(payload);
  }
}

function ProfessionalMobileAtendimentoDetailCard({ atendimento }: { atendimento: AtendimentoVisivel }) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-xl font-black text-slate-900">Atendimento #{atendimento.id}</h3>
        <AtendimentoStatusBadge status={atendimento.status} />
      </div>

      <div className="mt-5 grid gap-4">
        <MobileDetailItem label="Tipo de servico" value={getTipoServicoAtendimentoLabel(atendimento.tipoServico)} />
        <MobileDetailItem label="Cliente" value={getAtendimentoClienteLabel(atendimento)} />
        <MobileDetailItem label="Inicio previsto" value={formatDateTime(atendimento.inicioPrevistoEm)} />
        <MobileDetailItem label="Inicio real" value={formatDateTime(atendimento.inicioRealEm)} />
        <MobileDetailItem label="Fim real" value={formatDateTime(atendimento.fimRealEm)} />
        <MobileDetailItem label="Endereco" value={getAtendimentoEnderecoLabel(atendimento)} />
        <MobileDetailItem label="Bairro ou regiao" value={getAtendimentoRegiaoLabel(atendimento)} />
        <MobileDetailItem label="Valor estimado para voce" value={formatCurrency(atendimento.valorEstimadoProfissional)} />
      </div>
    </section>
  );
}

function MobileDetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.7rem] font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-800">{value}</p>
    </div>
  );
}

function MobileBackLink() {
  return (
    <Link
      className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
      to="/profissional/app/atendimentos"
    >
      Voltar para atendimentos
    </Link>
  );
}

function handleActionError({
  error,
  action,
  atendimentoId,
  logout,
  navigate,
  queryClient,
  refetchAtendimento,
  refetchCheckpoints,
  setFeedback,
}: {
  error: unknown;
  action: AttendanceAction;
  atendimentoId: number;
  logout: () => void;
  navigate: ReturnType<typeof useNavigate>;
  queryClient: ReturnType<typeof useQueryClient>;
  refetchAtendimento: () => Promise<unknown>;
  refetchCheckpoints: () => Promise<unknown>;
  setFeedback: (feedback: MobileFeedback) => void;
}) {
  if (error instanceof ApiError && error.status === 401) {
    logout();
    navigate('/entrar', { replace: true });
    return;
  }

  if (shouldRefreshAttendanceAfterActionError(error)) {
    void refreshProfessionalMobileAttendanceQueries(queryClient, atendimentoId);
    void Promise.all([refetchAtendimento(), refetchCheckpoints()]);
  }

  setFeedback({
    tone: 'error',
    title: buildAttendanceErrorTitle(error, action),
    message: buildAttendanceErrorMessage(error, action),
    details: error instanceof ApiError ? error.errors : [],
  });
}
