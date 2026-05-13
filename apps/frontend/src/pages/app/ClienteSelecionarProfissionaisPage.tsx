import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { FormAlert } from '../../components/ui/FormAlert';
import { StateBox } from '../../components/ui/PageState';
import { AvaliacoesProfissionalList } from '../../features/avaliacoes/AvaliacoesProfissionalList';
import { listarAvaliacoesProfissional } from '../../features/avaliacoes/avaliacoesApi';
import type { AvaliacaoProfissional } from '../../features/avaliacoes/types';
import { useAuth } from '../../features/auth/useAuth';
import { ProfissionaisElegiveisList } from '../../features/cliente/profissionais/ProfissionaisElegiveisList';
import { SelecaoProfissionaisPanel } from '../../features/cliente/profissionais/SelecaoProfissionaisPanel';
import {
  buscarSolicitacaoParaSelecao,
  listarProfissionaisDisponiveis,
  selecionarProfissionais,
} from '../../features/cliente/profissionais/profissionaisApi';
import type { ProfissionalDisponivel } from '../../features/cliente/profissionais/types';
import { formatDateTime } from '../../features/cliente/solicitacoes/SolicitacaoCard';
import { getSolicitacaoEnderecoLabel, getSolicitacaoRegiaoLabel } from '../../features/cliente/solicitacoes/solicitacaoDisplay';
import { canSelectProfessionals, getStatusSolicitacaoInfo, getTipoServicoLabel } from '../../features/cliente/solicitacoes/solicitacaoLabels';
import type { SolicitacaoFaxina } from '../../features/cliente/solicitacoes/types';
import { ApiError, getApiErrorMessage } from '../../services/apiClient';

const queryKeys = {
  solicitacoes: ['cliente', 'solicitacoes'],
  detalhe: (id: number) => ['cliente', 'solicitacoes', id],
  profissionais: (id: number) => ['cliente', 'solicitacoes', id, 'profissionais-disponiveis'],
  avaliacoes: (profissionalId: number) => ['cliente', 'profissionais', profissionalId, 'avaliacoes'],
};

type Feedback = {
  tone: 'error' | 'success';
  title: string;
  message: string;
  details?: string[];
};

type SelecaoProfissionaisLocationState = {
  feedback?: Feedback;
};

export function ClienteSelecionarProfissionaisPage() {
  const { id } = useParams();
  const solicitacaoId = Number(id);
  const { token, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [reviewsProfessional, setReviewsProfessional] = useState<ProfissionalDisponivel | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const validId = Number.isFinite(solicitacaoId) && solicitacaoId > 0;

  const solicitacaoQuery = useQuery({
    queryKey: validId ? queryKeys.detalhe(solicitacaoId) : ['cliente', 'solicitacoes', 'invalid'],
    queryFn: () => buscarSolicitacaoParaSelecao(requireToken(token), solicitacaoId),
    enabled: Boolean(token && validId),
  });

  const solicitacao = solicitacaoQuery.data;
  const selectionAllowed = Boolean(solicitacao && canSelectProfessionals(solicitacao.status));

  const profissionaisQuery = useQuery({
    queryKey: validId ? queryKeys.profissionais(solicitacaoId) : ['cliente', 'solicitacoes', 'invalid', 'profissionais'],
    queryFn: () => listarProfissionaisDisponiveis(requireToken(token), solicitacaoId),
    enabled: Boolean(token && validId && selectionAllowed),
  });

  const avaliacoesQuery = useQuery({
    queryKey: reviewsProfessional
      ? queryKeys.avaliacoes(reviewsProfessional.profissionalId)
      : ['cliente', 'profissionais', 'avaliacoes', 'sem-profissional'],
    queryFn: () => listarAvaliacoesProfissional(requireToken(token), reviewsProfessional?.profissionalId ?? 0),
    enabled: Boolean(token && reviewsProfessional),
  });

  const protectedError = useMemo(
    () =>
      [solicitacaoQuery.error, profissionaisQuery.error, avaliacoesQuery.error].find(
        (error) => error instanceof ApiError && error.status === 401,
      ),
    [avaliacoesQuery.error, profissionaisQuery.error, solicitacaoQuery.error],
  );

  useEffect(() => {
    if (protectedError) {
      logout();
      navigate('/entrar', { replace: true });
    }
  }, [logout, navigate, protectedError]);

  useEffect(() => {
    const navigationState = location.state as SelecaoProfissionaisLocationState | null;

    if (!navigationState?.feedback) {
      return;
    }

    setFeedback(navigationState.feedback);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const submitMutation = useMutation({
    mutationFn: (profissionalIds: number[]) => selecionarProfissionais(requireToken(token), solicitacaoId, { profissionalIds }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.solicitacoes }),
        queryClient.invalidateQueries({ queryKey: queryKeys.detalhe(solicitacaoId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.profissionais(solicitacaoId) }),
        queryClient.invalidateQueries({ queryKey: ['cliente', 'pagamentos'] }),
      ]);
      navigate(`/app/cliente/pagamentos/solicitacao/${solicitacaoId}`, {
        replace: true,
      });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        logout();
        navigate('/entrar', { replace: true });
        return;
      }

      setFeedback({
        tone: 'error',
        title: 'Nao foi possivel salvar a escolha',
        message: getApiErrorMessage(error),
        details: error instanceof ApiError ? error.errors : [],
      });
    },
  });

  const profissionais = profissionaisQuery.data ?? [];
  const selectedProfessionalId = selectedIds[0] ?? null;
  const selectedProfessional =
    profissionais.find((profissional) => profissional.profissionalId === selectedProfessionalId) ?? null;

  function toggleProfessional(profissional: ProfissionalDisponivel) {
    setFeedback(null);
    setValidationMessage(null);
    setSelectedIds((current) =>
      current[0] === profissional.profissionalId ? [] : [profissional.profissionalId],
    );
  }

  function clearSelection() {
    setValidationMessage(null);
    setSelectedIds([]);
  }

  function submitSelection() {
    setFeedback(null);

    if (!selectedProfessionalId) {
      setValidationMessage('Escolha uma profissional para continuar.');
      return;
    }

    submitMutation.mutate([selectedProfessionalId]);
  }

  if (!validId) {
    return (
      <div className="grid gap-5">
        <FormAlert tone="error" title="Solicitacao invalida" message="O identificador da solicitacao nao e valido." />
        <Link className="font-black text-cyan-700 hover:text-cyan-800" to="/app/cliente/solicitacoes">
          Voltar para solicitacoes
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-cyan-100 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Cliente</p>
            <h1 className="mt-3 text-3xl font-black tracking-normal text-slate-900 md:text-4xl">
              Escolher profissional
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              Escolha uma profissional disponivel para esta solicitacao. Depois da escolha, voce seguira para o pagamento.
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-cyan-100 px-5 text-sm font-black text-cyan-700 transition hover:bg-cyan-50"
            to="/app/cliente/solicitacoes"
          >
            Voltar
          </Link>
        </div>
      </section>

      {feedback && <FormAlert tone={feedback.tone} title={feedback.title} message={feedback.message} details={feedback.details} />}

      <RequestContextSection error={solicitacaoQuery.error} isLoading={solicitacaoQuery.isLoading} solicitacao={solicitacao} />

      {solicitacao && !selectionAllowed && (
        <SelectionStatusNotice solicitacao={solicitacao} />
      )}

      {selectionAllowed && (
        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="grid gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Profissionais elegiveis</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                O convite sera enviado apos a confirmacao do pagamento. A profissional podera aceitar ou recusar o convite.
              </p>
            </div>

            {profissionaisQuery.isLoading && (
              <StateBox tone="loading" title="Carregando profissionais" description="Buscando profissionais elegiveis para esta solicitacao." />
            )}

            {profissionaisQuery.isError && !protectedError && (
              <FormAlert
                tone="error"
                title="Nao foi possivel carregar profissionais"
                message={getApiErrorMessage(profissionaisQuery.error)}
                details={profissionaisQuery.error instanceof ApiError ? profissionaisQuery.error.errors : []}
              />
            )}

            {profissionaisQuery.isSuccess && profissionais.length === 0 && (
              <StateBox tone="empty" title="Nenhuma profissional elegivel" description="Nao ha profissionais disponiveis para os criterios desta solicitacao." />
            )}

            {profissionais.length > 0 && (
              <ProfissionaisElegiveisList
                profissionais={profissionais}
                selectedProfessionalId={selectedProfessionalId}
                onReadReviews={setReviewsProfessional}
                onToggle={toggleProfessional}
              />
            )}
          </section>

          <SelecaoProfissionaisPanel
            isSubmitting={submitMutation.isPending}
            profissional={selectedProfessional}
            validationMessage={validationMessage}
            onClear={clearSelection}
            onSubmit={submitSelection}
          />
        </div>
      )}

      {reviewsProfessional && (
        <AvaliacoesDialog
          avaliacoes={avaliacoesQuery.data ?? []}
          error={avaliacoesQuery.error}
          isLoading={avaliacoesQuery.isLoading}
          onClose={() => setReviewsProfessional(null)}
          profissional={reviewsProfessional}
        />
      )}
    </div>
  );
}

function AvaliacoesDialog({
  avaliacoes,
  error,
  isLoading,
  onClose,
  profissional,
}: {
  avaliacoes: AvaliacaoProfissional[];
  error: unknown;
  isLoading: boolean;
  onClose: () => void;
  profissional: ProfissionalDisponivel;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/40 p-3 sm:items-center sm:justify-center" role="presentation">
      <section
        aria-labelledby="avaliacoes-profissional-title"
        className="max-h-[85vh] w-full overflow-y-auto rounded-lg bg-white p-5 shadow-xl sm:max-w-2xl md:p-6"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Avaliacoes</p>
            <h2 id="avaliacoes-profissional-title" className="mt-2 text-2xl font-black text-slate-900">
              {profissional.nomeExibicao}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{formatRatingSummary(profissional)}</p>
          </div>
          <button
            className="min-h-10 rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
            type="button"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>

        <div className="mt-5">
          {isLoading && <StateBox tone="loading" title="Carregando avaliacoes" description="Buscando avaliacoes desta profissional." />}

          {Boolean(error) && (
            <FormAlert
              tone="error"
              title="Nao foi possivel carregar avaliacoes"
              message={getApiErrorMessage(error)}
              details={error instanceof ApiError ? error.errors : []}
            />
          )}

          {!isLoading && !error && <AvaliacoesProfissionalList avaliacoes={avaliacoes} />}
        </div>
      </section>
    </div>
  );
}

function SelectionStatusNotice({ solicitacao }: { solicitacao: SolicitacaoFaxina }) {
  if (solicitacao.status === 'AGUARDANDO_PAGAMENTO') {
    return (
      <div className="grid gap-3">
        <FormAlert
          tone="info"
          title="Profissional ja escolhida"
          message="A solicitacao ja tem uma profissional selecionada. O proximo passo e concluir o pagamento."
        />
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-700 px-5 text-sm font-black text-white transition hover:bg-cyan-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 md:w-fit"
          to={`/app/cliente/pagamentos/solicitacao/${solicitacao.id}`}
        >
          Ir para pagamento
        </Link>
      </div>
    );
  }

  if (solicitacao.status === 'PAGA_AGUARDANDO_ACEITE') {
    return (
      <FormAlert
        tone="info"
        title="Pagamento confirmado"
        message="Pagamento confirmado. Aguardando aceite da profissional."
      />
    );
  }

  if (solicitacao.status === 'NAO_ACEITA_CREDITO_GERADO') {
    return (
      <FormAlert
        tone="info"
        title="Reposicao disponivel"
        message="A profissional nao aceitou. Uma solicitacao de reposicao equivalente ficou disponivel."
      />
    );
  }

  if (solicitacao.status === 'ACEITA') {
    return (
      <FormAlert
        tone="success"
        title="Atendimento confirmado"
        message="Profissional confirmou o atendimento."
      />
    );
  }

  return (
    <FormAlert
      tone="info"
      title="Selecao indisponivel"
      message="Esta solicitacao nao esta em um status que permite escolher uma profissional."
    />
  );
}

function formatRating(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatRatingSummary(profissional: ProfissionalDisponivel) {
  if (profissional.totalAvaliacoes <= 0) {
    return 'Sem avaliacoes ainda';
  }

  return `Nota ${formatRating(profissional.notaMedia)} - ${profissional.totalAvaliacoes} avaliacao${
    profissional.totalAvaliacoes === 1 ? '' : 'oes'
  }`;
}

function RequestContextSection({
  error,
  isLoading,
  solicitacao,
}: {
  error: unknown;
  isLoading: boolean;
  solicitacao?: SolicitacaoFaxina;
}) {
  if (isLoading) {
    return <StateBox tone="loading" title="Carregando solicitacao" description="Buscando o contexto da solicitacao." />;
  }

  if (error) {
    return <FormAlert tone="error" title="Nao foi possivel carregar a solicitacao" message={getApiErrorMessage(error)} />;
  }

  if (!solicitacao) {
    return null;
  }

  const statusInfo = getStatusSolicitacaoInfo(solicitacao.status);

  return (
    <section className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-2xl font-black text-slate-900">Solicitacao #{solicitacao.id}</h2>
        <span className={`rounded-lg px-3 py-1 text-xs font-black uppercase tracking-[0.1em] ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      </div>
      <dl className="mt-5 grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Tipo" value={getTipoServicoLabel(solicitacao.tipoServico)} />
        <DetailItem label="Data desejada" value={formatDateTime(solicitacao.dataHoraDesejada)} />
        <DetailItem label="Duracao" value={`${solicitacao.duracaoEstimadaHoras} horas`} />
        <DetailItem label="Endereco" value={getSolicitacaoEnderecoLabel(solicitacao)} />
        <DetailItem label="Bairro/regiao" value={getSolicitacaoRegiaoLabel(solicitacao)} />
      </dl>
      <div className="mt-5 rounded-lg bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
        Depois da escolha, voce seguira para o pagamento. O convite sera enviado apos a confirmacao do pagamento.
      </div>
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold leading-6 text-slate-800">{value}</dd>
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
