import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { FormAlert } from '../../components/ui/FormAlert';
import { useAuth } from '../../features/auth/useAuth';
import { getAtendimentoEnderecoLabel } from '../../features/atendimentos/atendimentoDisplay';
import { listarMeusAtendimentos } from '../../features/atendimentos/atendimentosApi';
import type { AtendimentoVisivel, StatusAtendimento } from '../../features/atendimentos/types';
import {
  atualizarMeuPerfilProfissional,
  buscarMeuPerfilProfissional,
  buscarMinhaVerificacao,
} from '../../features/profissional/perfil/profissionalApi';
import type {
  DocumentoVerificacao,
  StatusAprovacaoProfissional,
  StatusVerificacao,
} from '../../features/profissional/perfil/types';
import { isConviteAtivo } from '../../features/profissional/convites/conviteLabels';
import { listarMeusConvites } from '../../features/profissional/convites/convitesApi';
import { ApiError, getApiErrorMessage } from '../../services/apiClient';

const queryKeys = {
  perfil: ['profissional', 'perfil'],
  verificacao: ['profissional', 'verificacao'],
  convites: ['profissional', 'convites'],
  atendimentos: ['atendimentos', 'meus', 'profissional'],
};

export function ProfessionalMobileHomePage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const perfilQuery = useQuery({
    queryKey: queryKeys.perfil,
    queryFn: () => buscarMeuPerfilProfissional(requireToken(token)),
    enabled: Boolean(token),
  });

  const verificacaoQuery = useQuery({
    queryKey: queryKeys.verificacao,
    queryFn: () => buscarMinhaVerificacao(requireToken(token)),
    enabled: Boolean(token),
    retry: (failureCount, error) => {
      if (isVerificationNotFound(error)) {
        return false;
      }

      return failureCount < 2;
    },
  });

  const convitesQuery = useQuery({
    queryKey: queryKeys.convites,
    queryFn: () => listarMeusConvites(requireToken(token)),
    enabled: Boolean(token),
  });

  const atendimentosQuery = useQuery({
    queryKey: queryKeys.atendimentos,
    queryFn: () => listarMeusAtendimentos(requireToken(token)),
    enabled: Boolean(token),
  });

  const protectedError = useMemo(
    () =>
      [perfilQuery.error, verificacaoQuery.error, convitesQuery.error, atendimentosQuery.error].find(
        (error) => error instanceof ApiError && error.status === 401,
      ),
    [perfilQuery.error, verificacaoQuery.error, convitesQuery.error, atendimentosQuery.error],
  );

  useEffect(() => {
    if (protectedError) {
      logout();
      navigate('/entrar', { replace: true });
    }
  }, [logout, navigate, protectedError]);

  const toggleDisponibilidadeMutation = useMutation({
    mutationFn: (ativoParaReceberChamados: boolean) =>
      atualizarMeuPerfilProfissional(requireToken(token), { ativoParaReceberChamados }),
    onSuccess: async (perfilAtualizado) => {
      queryClient.setQueryData(queryKeys.perfil, perfilAtualizado);
      await queryClient.invalidateQueries({ queryKey: queryKeys.perfil });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        logout();
        navigate('/entrar', { replace: true });
      }
    },
  });

  const perfil = perfilQuery.data ?? null;
  const convitesPendentes = (convitesQuery.data ?? []).filter(isConviteAtivo).length;
  const atendimentos = atendimentosQuery.data ?? [];
  const verificacaoNotFound = isVerificationNotFound(verificacaoQuery.error);
  const atendimentoEmExecucao = getPrimeiroAtendimentoPorStatus(atendimentos, 'EM_EXECUCAO');
  const proximoAtendimento = getPrimeiroAtendimentoPorStatus(atendimentos, 'CONFIRMADO');
  const hasNonProtectedError =
    (!protectedError && perfilQuery.isError) ||
    (!protectedError && verificacaoQuery.isError && !verificacaoNotFound) ||
    (!protectedError && convitesQuery.isError) ||
    (!protectedError && atendimentosQuery.isError) ||
    toggleDisponibilidadeMutation.isError;

  return (
    <div className="grid gap-3 overflow-x-hidden">
      {hasNonProtectedError && (
        <FormAlert
          tone="error"
          title="Alguns dados não puderam ser carregados"
          message={getHomeErrorMessage({
            perfilError: perfilQuery.error,
            verificacaoError: verificacaoNotFound ? null : verificacaoQuery.error,
            convitesError: convitesQuery.error,
            atendimentosError: atendimentosQuery.error,
            toggleError: toggleDisponibilidadeMutation.error,
          })}
        />
      )}

      <section className="overflow-hidden rounded-[1.5rem] border border-cyan-100 bg-white p-4 shadow-sm">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-cyan-700">Painel profissional</p>
        <h2 className="mt-2 text-xl font-black leading-tight text-slate-900">Resumo operacional</h2>
        <p className="mt-2 text-sm leading-5 text-slate-600">
          Veja seu status, convites pendentes e o próximo atendimento sem sair da tela inicial.
        </p>
      </section>

      <div className="grid gap-3">
        <MobileSummaryCard
          title="Recebimento de chamados"
          highlight={
            perfilQuery.isLoading
              ? 'Carregando status'
              : perfil
                ? perfil.ativoParaReceberChamados
                  ? 'Ativa para receber chamados'
                  : 'Inativa para novos chamados'
                : 'Status indisponível'
          }
          body={
            perfil
              ? `Aprovação atual: ${getStatusLabel(perfil.statusAprovacao)}. A disponibilidade é validada automaticamente pelo sistema.`
              : 'Use este atalho para consultar seu status atual no aplicativo.'
          }
          footer={
            perfil ? (
              <button
                className={[
                  'inline-flex min-h-12 w-full items-center justify-center rounded-2xl px-4 text-sm font-black transition',
                  perfil.ativoParaReceberChamados
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-cyan-700 text-white hover:bg-cyan-800',
                ].join(' ')}
                type="button"
                onClick={() => toggleDisponibilidadeMutation.mutate(!perfil.ativoParaReceberChamados)}
                disabled={toggleDisponibilidadeMutation.isPending}
              >
                {toggleDisponibilidadeMutation.isPending
                  ? 'Atualizando...'
                  : perfil.ativoParaReceberChamados
                    ? 'Ficar inativa'
                    : 'Ficar ativa'}
              </button>
            ) : null
          }
          tone={perfil?.ativoParaReceberChamados ? 'positive' : 'neutral'}
        />

        <MobileSummaryCard
          title="Convites pendentes"
          highlight={convitesQuery.isLoading ? 'Carregando convites' : `${convitesPendentes} pendente${convitesPendentes === 1 ? '' : 's'}`}
          body={
            convitesPendentes > 0
              ? 'Existem convites aguardando resposta. Priorize esta fila para não perder prazos.'
              : 'Nenhum convite pendente no momento.'
          }
          footer={<MobileCardLink href="/profissional/app/convites" label="Abrir convites" />}
          tone={convitesPendentes > 0 ? 'attention' : 'neutral'}
        />

        <MobileSummaryCard
          title="Próximo atendimento"
          highlight={
            atendimentosQuery.isLoading
              ? 'Carregando agenda'
              : proximoAtendimento
                ? formatDateTime(proximoAtendimento.inicioPrevistoEm)
                : 'Nenhum atendimento confirmado'
          }
          body={
            proximoAtendimento
              ? `${getAtendimentoEnderecoLabel(proximoAtendimento)} · ${formatCurrency(proximoAtendimento.valorEstimadoProfissional)} estimado para a profissional.`
              : 'Quando houver atendimento confirmado, ele aparecerá aqui.'
          }
          footer={<MobileCardLink href="/profissional/app/atendimentos" label="Abrir atendimentos" />}
        />

        <MobileSummaryCard
          title="Atendimento em andamento"
          highlight={
            atendimentoEmExecucao
              ? `Em execução desde ${formatTime(atendimentoEmExecucao.inicioRealEm ?? atendimentoEmExecucao.inicioPrevistoEm)}`
              : atendimentosQuery.isLoading
                ? 'Carregando status'
                : 'Nenhum atendimento em andamento'
          }
          body={
            atendimentoEmExecucao
              ? `${getAtendimentoEnderecoLabel(atendimentoEmExecucao)}. Use os detalhes para acompanhar o serviço em andamento.`
              : 'Assim que houver um atendimento iniciado, o resumo aparecerá aqui.'
          }
          footer={<MobileCardLink href="/profissional/app/atendimentos" label="Ver atendimentos" />}
          tone={atendimentoEmExecucao ? 'attention' : 'neutral'}
        />

        <MobileSummaryCard
          title="Status da verificação"
          highlight={
            verificacaoQuery.isLoading
              ? 'Carregando verificação'
              : verificacaoQuery.data
                ? getStatusLabel(verificacaoQuery.data.statusVerificacao)
                : 'Nenhum envio registrado'
          }
          body={getVerificationBody(verificacaoQuery.data, verificacaoNotFound)}
          footer={<MobileCardLink href="/profissional/app/verificacao" label="Ver verificação" />}
          tone={getVerificationTone(verificacaoQuery.data, verificacaoNotFound)}
        />
      </div>

      <section className="grid grid-cols-2 gap-3">
        <QuickActionLink href="/profissional/app/perfil" label="Perfil" description="Atualize seus dados permitidos." />
        <QuickActionLink href="/profissional/app/disponibilidade" label="Agenda" description="Organize seus dias e horários." />
        <QuickActionLink href="/profissional/app/ocorrencias" label="Ocorrências" description="Acompanhe registros e pendências." />
      </section>
    </div>
  );
}

function MobileSummaryCard({
  title,
  highlight,
  body,
  footer,
  tone = 'neutral',
}: {
  title: string;
  highlight: string;
  body: string;
  footer?: ReactNode;
  tone?: 'neutral' | 'positive' | 'attention';
}) {
  const toneClassName = {
    neutral: 'border-slate-200 bg-white',
    positive: 'border-cyan-100 bg-cyan-50/60',
    attention: 'border-amber-100 bg-amber-50/70',
  };

  return (
    <article className={`min-w-0 overflow-hidden rounded-[1.5rem] border p-4 shadow-sm ${toneClassName[tone]}`}>
      <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-slate-500">{title}</p>
      <p className="mt-2.5 min-w-0 break-words text-[1.05rem] font-black leading-6 text-slate-900">{highlight}</p>
      <p className="mt-2 break-words whitespace-normal text-sm leading-5 text-slate-600">{body}</p>
      {footer && <div className="mt-4">{footer}</div>}
    </article>
  );
}

function QuickActionLink({ href, label, description }: { href: string; label: string; description: string }) {
  return (
    <Link
      className="min-w-0 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50"
      to={href}
    >
      <p className="break-words text-[0.95rem] font-black text-slate-900">{label}</p>
      <p className="mt-2 break-words text-sm leading-5 text-slate-600">{description}</p>
    </Link>
  );
}

function MobileCardLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
      to={href}
    >
      {label}
    </Link>
  );
}

function getPrimeiroAtendimentoPorStatus(atendimentos: AtendimentoVisivel[], status: StatusAtendimento) {
  return [...atendimentos]
    .filter((atendimento) => atendimento.status === status)
    .sort((left, right) => new Date(left.inicioPrevistoEm).getTime() - new Date(right.inicioPrevistoEm).getTime())[0] ?? null;
}

function getVerificationBody(verificacao: DocumentoVerificacao | undefined, verificacaoNotFound: boolean) {
  if (verificacao?.observacaoAnalise) {
    return `Observação da análise: ${verificacao.observacaoAnalise}`;
  }

  if (verificacao) {
    return `Documento ${verificacao.tipoDocumento} registrado. Acompanhe o status para saber se há alguma pendência.`;
  }

  if (verificacaoNotFound) {
    return 'Ainda não há verificação registrada nesta conta. Abra o status documental para enviar seus arquivos.';
  }

  return 'Use este card para acompanhar seu status documental e reenviar arquivos quando necessário.';
}

function getVerificationTone(verificacao: DocumentoVerificacao | undefined, verificacaoNotFound: boolean) {
  if (verificacao?.statusVerificacao === 'APROVADO') {
    return 'positive';
  }

  if (verificacao?.statusVerificacao === 'REJEITADO' || verificacaoNotFound) {
    return 'attention';
  }

  return 'neutral';
}

function getStatusLabel(status: StatusAprovacaoProfissional | StatusVerificacao) {
  const labels: Record<StatusAprovacaoProfissional | StatusVerificacao, string> = {
    PENDENTE: 'Pendente',
    EM_ANALISE: 'Em análise',
    APROVADO: 'Aprovado',
    REJEITADO: 'Rejeitado',
  };

  return labels[status];
}

function getHomeErrorMessage({
  perfilError,
  verificacaoError,
  convitesError,
  atendimentosError,
  toggleError,
}: {
  perfilError: unknown;
  verificacaoError: unknown;
  convitesError: unknown;
  atendimentosError: unknown;
  toggleError: unknown;
}) {
  const firstError = [toggleError, perfilError, verificacaoError, convitesError, atendimentosError].find(
    (error) => error !== null && error !== undefined,
  );

  return firstError ? getApiErrorMessage(firstError) : 'Não foi possível carregar a home mobile.';
}

function isVerificationNotFound(error: unknown) {
  return error instanceof ApiError && error.status === 404 && error.code === 'VERIFICACAO_NOT_FOUND';
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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
