import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { FormAlert } from '../../components/ui/FormAlert';
import { StateBox } from '../../components/ui/PageState';
import { useAuth } from '../../features/auth/useAuth';
import {
  definirMinhasRegioesProfissional,
  listarMinhasRegioesProfissional,
  listarRegioesAtivas,
} from '../../features/profissional/perfil/profissionalApi';
import { ProfissionalRegioesForm } from '../../features/profissional/regioes/ProfissionalRegioesForm';
import { ApiError, getApiErrorMessage } from '../../services/apiClient';

const queryKeys = {
  regioes: ['regioes'],
  minhasRegioes: ['profissional', 'regioes'],
};

type Feedback = {
  tone: 'error' | 'success';
  title: string;
  message: string;
  details?: string[];
};

export function ProfessionalMobileRegioesPage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const regioesQuery = useQuery({
    queryKey: queryKeys.regioes,
    queryFn: listarRegioesAtivas,
  });

  const minhasRegioesQuery = useQuery({
    queryKey: queryKeys.minhasRegioes,
    queryFn: () => listarMinhasRegioesProfissional(requireToken(token)),
    enabled: Boolean(token),
  });

  const protectedError = useMemo(
    () =>
      [minhasRegioesQuery.error].find((error) => error instanceof ApiError && error.status === 401) ?? null,
    [minhasRegioesQuery.error],
  );

  useEffect(() => {
    if (protectedError) {
      logout();
      navigate('/entrar', { replace: true });
    }
  }, [logout, navigate, protectedError]);

  const saveMutation = useMutation({
    mutationFn: (regiaoIds: number[]) => definirMinhasRegioesProfissional(requireToken(token), { regiaoIds }),
    onMutate: () => {
      setFeedback(null);
    },
    onSuccess: async (regioesSalvas) => {
      queryClient.setQueryData(queryKeys.minhasRegioes, regioesSalvas);
      await queryClient.invalidateQueries({ queryKey: queryKeys.minhasRegioes });
      await minhasRegioesQuery.refetch();
      setFeedback({
        tone: 'success',
        title: 'Regioes atualizadas',
        message: 'Suas regioes de atendimento foram salvas com sucesso.',
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
        title: buildSaveErrorTitle(error),
        message: buildSaveErrorMessage(error),
        details: error instanceof ApiError ? error.errors : [],
      });
    },
  });

  const totalAtivas = regioesQuery.data?.length ?? 0;
  const totalSelecionadas = minhasRegioesQuery.data?.length ?? 0;

  return (
    <div className="grid gap-4">
      <section className="rounded-[1.75rem] border border-cyan-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Regioes</p>
        <h2 className="mt-3 text-2xl font-black text-slate-900">Onde voce atende</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Escolha as regioes em que voce deseja receber chamados. A elegibilidade final continua sendo validada pelo backend.
        </p>
      </section>

      {feedback && <FormAlert tone={feedback.tone} title={feedback.title} message={feedback.message} details={feedback.details} />}

      <section className="grid gap-3 sm:grid-cols-2">
        <SummaryCard label="Regioes ativas" value={regioesQuery.isLoading ? 'Carregando...' : `${totalAtivas}`} />
        <SummaryCard
          label="Regioes selecionadas"
          value={minhasRegioesQuery.isLoading ? 'Carregando...' : `${totalSelecionadas}`}
        />
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        {(regioesQuery.isLoading || minhasRegioesQuery.isLoading) && (
          <StateBox
            tone="loading"
            title="Carregando regioes"
            description="Buscando as regioes ativas e as selecoes atuais do seu perfil."
            className="rounded-[1.5rem]"
          />
        )}

        {(regioesQuery.isError || minhasRegioesQuery.isError) && !protectedError && (
          <FormAlert
            tone="error"
            title="Nao foi possivel carregar as regioes"
            message={getApiErrorMessage(regioesQuery.error ?? minhasRegioesQuery.error)}
            details={
              regioesQuery.error instanceof ApiError
                ? regioesQuery.error.errors
                : minhasRegioesQuery.error instanceof ApiError
                  ? minhasRegioesQuery.error.errors
                  : []
            }
          />
        )}

        {regioesQuery.data && minhasRegioesQuery.data && (
          <ProfissionalRegioesForm
            regioes={regioesQuery.data}
            selectedRegioes={minhasRegioesQuery.data}
            isSubmitting={saveMutation.isPending}
            onSubmit={handleRegioesSubmit}
          />
        )}
      </section>

      <div className="grid gap-3">
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
          to="/profissional/app/perfil"
        >
          Voltar para o perfil mobile
        </Link>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
          to="/app/profissional/regioes"
        >
          Abrir configuracao completa atual
        </Link>
      </div>
    </div>
  );

  async function handleRegioesSubmit(regiaoIds: number[]) {
    if (saveMutation.isPending) {
      return;
    }

    await saveMutation.mutateAsync(regiaoIds);
  }
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[0.7rem] font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
    </section>
  );
}

function buildSaveErrorTitle(error: unknown) {
  if (error instanceof ApiError && error.status === 403) {
    return 'Voce nao pode alterar estas regioes';
  }

  return 'Nao foi possivel salvar as regioes';
}

function buildSaveErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 403) {
    return 'Voce nao tem permissao para atualizar suas regioes de atendimento.';
  }

  return getApiErrorMessage(error);
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
