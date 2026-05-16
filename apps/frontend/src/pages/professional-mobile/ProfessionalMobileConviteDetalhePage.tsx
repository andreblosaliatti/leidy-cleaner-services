import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { FormAlert } from '../../components/ui/FormAlert';
import { StateBox } from '../../components/ui/PageState';
import { useAuth } from '../../features/auth/useAuth';
import { ConviteStatusBadge } from '../../features/profissional/convites/ConviteStatusBadge';
import {
  formatCurrency,
  formatDateTime,
  formatInviteLocation,
  getStatusConviteEfetivo,
  getTipoServicoLabel,
  isConviteAtivo,
} from '../../features/profissional/convites/conviteLabels';
import { aceitarConvite, buscarConvite, recusarConvite } from '../../features/profissional/convites/convitesApi';
import type { ConviteProfissional, ConviteResposta } from '../../features/profissional/convites/types';
import { ApiError, getApiErrorMessage } from '../../services/apiClient';

const queryKeys = {
  convites: ['profissional', 'convites', 'mobile'],
  detalhe: (id: number) => ['profissional', 'convites', 'mobile', id],
};

type Feedback = {
  tone: 'error' | 'success' | 'info';
  title: string;
  message: string;
  details?: string[];
};

type ConviteAction = 'aceitar' | 'recusar';

export function ProfessionalMobileConviteDetalhePage() {
  const { id } = useParams();
  const conviteId = Number(id);
  const validId = Number.isFinite(conviteId) && conviteId > 0;
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pendingAction, setPendingAction] = useState<ConviteAction | null>(null);

  const conviteQuery = useQuery({
    queryKey: validId ? queryKeys.detalhe(conviteId) : ['profissional', 'convites', 'mobile', 'invalid'],
    queryFn: () => buscarConvite(requireToken(token), conviteId),
    enabled: Boolean(token && validId),
  });

  const protectedError = useMemo(
    () => (conviteQuery.error instanceof ApiError && conviteQuery.error.status === 401 ? conviteQuery.error : null),
    [conviteQuery.error],
  );

  useEffect(() => {
    if (protectedError) {
      logout();
      navigate('/entrar', { replace: true });
    }
  }, [logout, navigate, protectedError]);

  const responseMutation = useMutation({
    mutationFn: (action: ConviteAction) => {
      const activeToken = requireToken(token);
      return action === 'aceitar' ? aceitarConvite(activeToken, conviteId) : recusarConvite(activeToken, conviteId);
    },
    onMutate: (action) => {
      setPendingAction(action);
      setFeedback(null);
    },
    onSuccess: async (response, action) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.convites }),
        queryClient.invalidateQueries({ queryKey: queryKeys.detalhe(conviteId) }),
        conviteQuery.refetch(),
      ]);

      setFeedback({
        tone: 'success',
        title: action === 'aceitar' ? 'Convite aceito' : 'Convite recusado',
        message: buildSuccessMessage(action, response),
      });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        logout();
        navigate('/entrar', { replace: true });
        return;
      }

      if (shouldRefreshAfterActionError(error)) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.convites });
        void queryClient.invalidateQueries({ queryKey: queryKeys.detalhe(conviteId) });
        void conviteQuery.refetch();
      }

      setFeedback({
        tone: 'error',
        title: buildErrorTitle(error),
        message: buildErrorMessage(error),
        details: error instanceof ApiError ? error.errors : [],
      });
    },
    onSettled: () => {
      setPendingAction(null);
    },
  });

  function handleRespond(action: ConviteAction) {
    if (responseMutation.isPending) {
      return;
    }

    responseMutation.mutate(action);
  }

  if (!validId) {
    return (
      <div className="grid gap-4">
        <FormAlert tone="error" title="Convite invalido" message="O identificador informado para este convite nao e valido." />
        <MobileBackLink />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-[1.75rem] border border-cyan-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Convite</p>
        <h2 className="mt-3 text-2xl font-black text-slate-900">Detalhe do convite</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Confira os detalhes do servico e responda ao convite quando ele ainda estiver disponivel.
        </p>
      </section>

      {feedback && <FormAlert tone={feedback.tone} title={feedback.title} message={feedback.message} details={feedback.details} />}

      {conviteQuery.isLoading && (
        <StateBox tone="loading" title="Carregando convite" description="Buscando os dados completos deste convite." className="rounded-[1.75rem]" />
      )}

      {conviteQuery.isError && !protectedError && (
        <FormAlert
          tone="error"
          title="Nao foi possivel carregar o convite"
          message={getApiErrorMessage(conviteQuery.error)}
          details={conviteQuery.error instanceof ApiError ? conviteQuery.error.errors : []}
        />
      )}

      {conviteQuery.data && (
        <ProfessionalMobileConviteDetailCard
          convite={conviteQuery.data}
          isResponding={responseMutation.isPending}
          pendingAction={pendingAction}
          onRespond={handleRespond}
        />
      )}

      <MobileBackLink />
    </div>
  );
}

function ProfessionalMobileConviteDetailCard({
  convite,
  isResponding,
  onRespond,
  pendingAction,
}: {
  convite: ConviteProfissional;
  isResponding: boolean;
  onRespond: (action: ConviteAction) => void;
  pendingAction: ConviteAction | null;
}) {
  const statusEfetivo = getStatusConviteEfetivo(convite);
  const canRespond = isConviteAtivo(convite);

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-xl font-black text-slate-900">Convite #{convite.conviteId}</h3>
        <ConviteStatusBadge status={statusEfetivo} />
      </div>

      <div className="mt-5 grid gap-4">
        <MobileDetailItem label="Tipo de servico" value={getTipoServicoLabel(convite.tipoServico)} />
        <MobileDetailItem label="Data e hora" value={formatDateTime(convite.dataHoraDesejada)} />
        <MobileDetailItem label="Duracao estimada" value={`${convite.duracaoEstimadaHoras} hora${convite.duracaoEstimadaHoras === 1 ? '' : 's'}`} />
        <MobileDetailItem label="Regiao informada" value={formatInviteLocation(convite)} />
        <MobileDetailItem label="Valor estimado da profissional" value={formatCurrency(Number(convite.valorEstimadoProfissional))} />
        <MobileDetailItem label="Enviado em" value={formatDateTime(convite.enviadoEm)} />
        <MobileDetailItem label="Expira em" value={formatDateTime(convite.expiraEm)} />
      </div>

      {canRespond ? (
        <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5">
          <button
            className="min-h-12 rounded-[1.25rem] bg-cyan-700 px-4 text-sm font-black text-white transition hover:bg-cyan-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            disabled={isResponding}
            type="button"
            onClick={() => onRespond('aceitar')}
          >
            {pendingAction === 'aceitar' ? 'Aceitando convite...' : 'Aceitar convite'}
          </button>
          <button
            className="min-h-12 rounded-[1.25rem] border border-red-100 bg-white px-4 text-sm font-black text-red-700 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
            disabled={isResponding}
            type="button"
            onClick={() => onRespond('recusar')}
          >
            {pendingAction === 'recusar' ? 'Recusando convite...' : 'Recusar convite'}
          </button>
          <p className="text-sm leading-6 text-slate-500">Sua resposta sera confirmada somente apos o retorno do sistema.</p>
        </div>
      ) : (
        <div className="mt-5">
          <FormAlert
            tone="info"
            message={
              statusEfetivo === 'EXPIRADO'
                ? 'Este convite expirou e nao esta mais disponivel para resposta.'
                : 'Este convite nao esta mais disponivel para resposta.'
            }
          />
        </div>
      )}
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
      to="/profissional/app/convites"
    >
      Voltar para convites
    </Link>
  );
}

function buildSuccessMessage(action: ConviteAction, response: ConviteResposta) {
  if (action === 'aceitar') {
    return response.atendimentoId
      ? `Convite aceito com sucesso. Atendimento #${response.atendimentoId} confirmado.`
      : 'Convite aceito com sucesso.'
  }

  return 'Convite recusado com sucesso.'
}

function buildErrorTitle(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return 'Voce nao pode responder a este convite';
    }

    if (error.code === 'CONVITE_EXPIRADO') {
      return 'Convite expirado';
    }

    if (error.code === 'CONVITE_STATUS_INCOMPATIVEL' || error.code === 'ATENDIMENTO_JA_CRIADO' || error.status === 409) {
      return 'Convite indisponivel';
    }

    if (error.code === 'CONVITE_NOT_FOUND' || error.status === 404) {
      return 'Convite nao encontrado';
    }
  }

  return 'Nao foi possivel responder ao convite';
}

function buildErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return 'Voce nao tem permissao para responder a este convite.'
    }

    if (error.code === 'CONVITE_EXPIRADO') {
      return 'Este convite expirou e nao pode mais ser respondido.'
    }

    if (error.code === 'CONVITE_STATUS_INCOMPATIVEL' || error.code === 'ATENDIMENTO_JA_CRIADO') {
      return 'Este convite nao esta mais disponivel para resposta.'
    }

    if (error.status === 409) {
      return 'Este convite nao esta mais disponivel para resposta.';
    }

    if (error.code === 'CONVITE_NOT_FOUND' || error.status === 404) {
      return 'Este convite nao esta disponivel para sua conta.'
    }
  }

  return getApiErrorMessage(error)
}

function shouldRefreshAfterActionError(error: unknown) {
  if (!(error instanceof ApiError)) {
    return false;
  }

  return (
    error.code === 'CONVITE_EXPIRADO' ||
    error.code === 'CONVITE_STATUS_INCOMPATIVEL' ||
    error.code === 'ATENDIMENTO_JA_CRIADO' ||
    error.code === 'CONVITE_NOT_FOUND' ||
    error.status === 404 ||
    error.status === 409
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
