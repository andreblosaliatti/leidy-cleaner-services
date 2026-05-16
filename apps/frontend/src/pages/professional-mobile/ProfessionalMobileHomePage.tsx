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
    <div className="grid gap-4">
      {hasNonProtectedError && (
        <FormAlert
          tone="error"
          title="Alguns dados nao puderam ser carregados"
          message={getHomeErrorMessage({
            perfilError: perfilQuery.error,
            verificacaoError: verificacaoNotFound ? null : verificacaoQuery.error,
            convitesError: convitesQuery.error,
            atendimentosError: atendimentosQuery.error,
            toggleError: toggleDisponibilidadeMutation.error,
          })}
        />
      )}

      <section className="rounded-[1.75rem] border border-cyan-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Inicio mobile</p>
        <h2 className="mt-3 text-2xl font-black text-slate-900">Resumo operacional</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Acompanhe seus convites, atendimentos e ajustes principais da rotina profissional em uma experiencia pensada para celular.
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
                : 'Status indisponivel'
          }
          body={
            perfil
              ? `Aprovacao atual: ${getStatusLabel(perfil.statusAprovacao)}. A elegibilidade final continua sendo calculada no backend.`
              : 'Use este atalho para visualizar seu status atual sem depender da area desktop.'
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
              ? 'Existem convites aguardando resposta. O aceite transacional continua protegido no backend.'
              : 'Nenhum convite pendente agora. Novos convites aparecerao aqui quando a tela mobile completa entrar.'
          }
          footer={<MobileCardLink href="/profissional/app/convites" label="Abrir area de convites" />}
          tone={convitesPendentes > 0 ? 'attention' : 'neutral'}
        />

        <MobileSummaryCard
          title="Proximo atendimento"
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
              : 'Quando houver atendimento confirmado pelo backend, ele sera destacado aqui.'
          }
          footer={<MobileCardLink href="/profissional/app/atendimentos" label="Abrir area de atendimentos" />}
        />

        <MobileSummaryCard
          title="Atendimento em andamento"
          highlight={
            atendimentoEmExecucao
              ? `Em execucao desde ${formatTime(atendimentoEmExecucao.inicioRealEm ?? atendimentoEmExecucao.inicioPrevistoEm)}`
              : atendimentosQuery.isLoading
                ? 'Carregando status'
                : 'Nenhum atendimento em andamento'
          }
          body={
            atendimentoEmExecucao
              ? `${getAtendimentoEnderecoLabel(atendimentoEmExecucao)}. Inicio e fim do servico continuam autorizados pelo backend.`
              : 'Assim que houver um atendimento iniciado, o resumo aparece aqui.'
          }
          footer={<MobileCardLink href="/profissional/app/atendimentos" label="Ver atendimentos" />}
          tone={atendimentoEmExecucao ? 'attention' : 'neutral'}
        />

        <MobileSummaryCard
          title="Status da verificacao"
          highlight={
            verificacaoQuery.isLoading
              ? 'Carregando verificacao'
              : verificacaoQuery.data
                ? getStatusLabel(verificacaoQuery.data.statusVerificacao)
                : 'Nenhum envio registrado'
          }
          body={getVerificationBody(verificacaoQuery.data, verificacaoNotFound)}
          footer={<MobileCardLink href="/profissional/app/verificacao" label="Abrir status documental" />}
          tone={getVerificationTone(verificacaoQuery.data, verificacaoNotFound)}
        />
      </div>

      <section className="grid grid-cols-2 gap-3">
        <QuickActionLink href="/profissional/app/perfil" label="Perfil" description="Atualize seus dados profissionais permitidos." />
        <QuickActionLink href="/profissional/app/disponibilidade" label="Agenda" description="Organize seus dias e horarios de atendimento." />
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
    <article className={`rounded-[1.75rem] border p-5 shadow-sm ${toneClassName[tone]}`}>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <p className="mt-3 text-xl font-black text-slate-900">{highlight}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
      {footer && <div className="mt-4">{footer}</div>}
    </article>
  );
}

function QuickActionLink({ href, label, description }: { href: string; label: string; description: string }) {
  return (
    <Link className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50" to={href}>
      <p className="text-base font-black text-slate-900">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
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
    return `Observacao da analise: ${verificacao.observacaoAnalise}`;
  }

  if (verificacao) {
    return `Documento ${verificacao.tipoDocumento} registrado. Acompanhe o retorno do backend antes de depender disso para elegibilidade.`;
  }

  if (verificacaoNotFound) {
    return 'Ainda nao ha verificacao registrada nesta conta. Voce ja pode abrir o status documental para enviar seus arquivos pelo celular.';
  }

  return 'Use este card para acompanhar seu status documental e reenviar arquivos quando necessario, sempre com o backend definindo o status final.';
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
    EM_ANALISE: 'Em analise',
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

  return firstError ? getApiErrorMessage(firstError) : 'Nao foi possivel carregar a home mobile.';
}

function isVerificationNotFound(error: unknown) {
  return error instanceof ApiError && error.status === 404 && error.code === 'VERIFICACAO_NOT_FOUND';
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
