import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { FormAlert } from '../../components/ui/FormAlert';
import { StateBox } from '../../components/ui/PageState';
import { useAuth } from '../../features/auth/useAuth';
import { formatAvaliacaoDateTime, formatNotaAvaliacao } from '../../features/avaliacoes/avaliacaoLabels';
import { listarAvaliacoesProfissional } from '../../features/avaliacoes/avaliacoesApi';
import type { AvaliacaoProfissional } from '../../features/avaliacoes/types';
import { buscarMeuPerfilProfissional } from '../../features/profissional/perfil/profissionalApi';
import { ApiError, getApiErrorMessage } from '../../services/apiClient';

const queryKeys = {
  perfil: ['profissional', 'perfil'],
  avaliacoes: (profissionalId: number) => ['avaliacoes', 'profissional', 'mobile', profissionalId],
};

export function ProfessionalMobileAvaliacoesPage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const perfilQuery = useQuery({
    queryKey: queryKeys.perfil,
    queryFn: () => buscarMeuPerfilProfissional(requireToken(token)),
    enabled: Boolean(token),
  });

  const avaliacoesQuery = useQuery({
    queryKey: perfilQuery.data ? queryKeys.avaliacoes(perfilQuery.data.id) : ['avaliacoes', 'profissional', 'mobile', 'pending'],
    queryFn: () => listarAvaliacoesProfissional(requireToken(token), perfilQuery.data!.id),
    enabled: Boolean(token) && Boolean(perfilQuery.data?.id),
  });

  const protectedError = useMemo(
    () =>
      [perfilQuery.error, avaliacoesQuery.error].find(
        (error) => error instanceof ApiError && error.status === 401,
      ) ?? null,
    [avaliacoesQuery.error, perfilQuery.error],
  );

  useEffect(() => {
    if (protectedError) {
      logout();
      navigate('/entrar', { replace: true });
    }
  }, [logout, navigate, protectedError]);

  const perfil = perfilQuery.data ?? null;
  const avaliacoes = avaliacoesQuery.data ?? [];
  const notaMediaExibicao = perfil && perfil.totalAvaliacoes > 0 ? formatAverageRating(perfil.notaMedia) : null;
  const totalAvaliacoesExibicao = perfil?.totalAvaliacoes ?? avaliacoes.length;
  const hasNonProtectedError =
    (!protectedError && perfilQuery.isError) || (!protectedError && avaliacoesQuery.isError);
  const visibleError = (avaliacoesQuery.error ?? perfilQuery.error) as unknown;

  return (
    <div className="grid gap-3 overflow-x-hidden">
      <section className="overflow-hidden rounded-[1.5rem] border border-cyan-100 bg-white p-4 shadow-sm">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-cyan-700">Avaliações</p>
        <h2 className="mt-2 text-xl font-black leading-tight text-slate-900">Avaliações</h2>
        <p className="mt-2 text-sm leading-5 text-slate-600">
          Veja as avaliações recebidas após atendimentos finalizados.
        </p>
      </section>

      {hasNonProtectedError && (
        <section className="grid gap-3">
          <FormAlert
            tone="error"
            title="Não foi possível carregar as avaliações"
            message={getApiErrorMessage(visibleError)}
            details={visibleError instanceof ApiError ? visibleError.errors : []}
          />
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
            type="button"
            onClick={() => {
              void perfilQuery.refetch();
              if (perfilQuery.data?.id) {
                void avaliacoesQuery.refetch();
              }
            }}
          >
            Tentar novamente
          </button>
        </section>
      )}

      {(perfilQuery.isLoading || (perfilQuery.isSuccess && avaliacoesQuery.isLoading)) && (
        <StateBox
          tone="loading"
          title="Carregando avaliações"
          description="Buscando seu histórico de avaliações recebidas."
          className="rounded-[1.5rem]"
        />
      )}

      {perfil && !hasNonProtectedError && (
        <section className="grid grid-cols-2 gap-3">
          <SummaryStatCard
            label="Nota média"
            value={notaMediaExibicao ? `${notaMediaExibicao} / 5` : 'Sem nota'}
            helper={notaMediaExibicao ? 'Média das avaliações recebidas' : 'Ainda sem avaliações'}
          />
          <SummaryStatCard
            label="Total"
            value={`${totalAvaliacoesExibicao}`}
            helper={`${totalAvaliacoesExibicao} ${totalAvaliacoesExibicao === 1 ? 'avaliação registrada' : 'avaliações registradas'}`}
          />
        </section>
      )}

      {perfil && perfilQuery.isSuccess && avaliacoesQuery.isSuccess && avaliacoes.length === 0 && !hasNonProtectedError && (
        <StateBox
          tone="empty"
          title="Você ainda não recebeu avaliações."
          description="Quando clientes avaliarem seus atendimentos finalizados, elas aparecerão aqui."
          className="rounded-[1.5rem]"
        />
      )}

      {avaliacoes.length > 0 && !hasNonProtectedError && (
        <div className="grid gap-3">
          {avaliacoes.map((avaliacao) => (
            <AvaliacaoMobileCard key={avaliacao.avaliacaoId} avaliacao={avaliacao} />
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryStatCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 break-words text-[1.2rem] font-black leading-6 text-slate-900">{value}</p>
      <p className="mt-1 break-words text-xs leading-5 text-slate-600">{helper}</p>
    </section>
  );
}

function AvaliacaoMobileCard({ avaliacao }: { avaliacao: AvaliacaoProfissional }) {
  const hasComment = Boolean(avaliacao.comentario?.trim());

  return (
    <article className="min-w-0 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-slate-500">Atendimento #{avaliacao.atendimentoId}</p>
          <p className="mt-2 break-words text-base font-black text-slate-900">
            {buildStars(avaliacao.nota)} <span className="ml-1 text-sm text-slate-600">({formatNotaAvaliacao(avaliacao.nota)})</span>
          </p>
        </div>
        <span className="inline-flex shrink-0 rounded-2xl bg-cyan-50 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.1em] text-cyan-700">
          Nota {avaliacao.nota}
        </span>
      </div>

      <div className="mt-4 grid gap-3 text-sm leading-5 text-slate-700">
        <MetaRow label="Recebida em" value={formatAvaliacaoDateTime(avaliacao.criadoEm)} />
        <MetaRow label="Comentário" value={hasComment ? avaliacao.comentario!.trim() : 'Sem comentário informado.'} muted={!hasComment} />
      </div>
    </article>
  );
}

function MetaRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={['mt-1 break-words whitespace-normal text-sm leading-5', muted ? 'text-slate-500' : 'text-slate-800'].join(' ')}>
        {value}
      </p>
    </div>
  );
}

function buildStars(nota: number) {
  return Array.from({ length: 5 }, (_, index) => (index < nota ? '★' : '☆')).join('');
}

function formatAverageRating(notaMedia: number) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(Number(notaMedia));
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
