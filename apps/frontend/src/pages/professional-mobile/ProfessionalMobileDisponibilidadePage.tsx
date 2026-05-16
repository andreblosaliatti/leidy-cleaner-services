import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { FormAlert } from '../../components/ui/FormAlert';
import { StateBox } from '../../components/ui/PageState';
import { useAuth } from '../../features/auth/useAuth';
import { DisponibilidadeForm } from '../../features/profissional/disponibilidades/DisponibilidadeForm';
import { DisponibilidadeList } from '../../features/profissional/disponibilidades/DisponibilidadeList';
import {
  atualizarDisponibilidade,
  criarDisponibilidade,
  excluirDisponibilidade,
  listarMinhasDisponibilidades,
} from '../../features/profissional/perfil/profissionalApi';
import type {
  DisponibilidadeProfissional,
  DisponibilidadeProfissionalRequest,
} from '../../features/profissional/perfil/types';
import { ApiError, getApiErrorMessage } from '../../services/apiClient';

const queryKeys = {
  disponibilidades: ['profissional', 'disponibilidades'],
};

type Feedback = {
  tone: 'error' | 'success';
  title: string;
  message: string;
  details?: string[];
};

export function ProfessionalMobileDisponibilidadePage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [editingDisponibilidade, setEditingDisponibilidade] = useState<DisponibilidadeProfissional | null>(null);
  const [deletingDisponibilidadeId, setDeletingDisponibilidadeId] = useState<number | null>(null);
  const [formKey, setFormKey] = useState(0);

  const disponibilidadesQuery = useQuery({
    queryKey: queryKeys.disponibilidades,
    queryFn: () => listarMinhasDisponibilidades(requireToken(token)),
    enabled: Boolean(token),
  });

  const protectedError = useMemo(
    () =>
      disponibilidadesQuery.error instanceof ApiError && disponibilidadesQuery.error.status === 401
        ? disponibilidadesQuery.error
        : null,
    [disponibilidadesQuery.error],
  );

  useEffect(() => {
    if (protectedError) {
      logout();
      navigate('/entrar', { replace: true });
    }
  }, [logout, navigate, protectedError]);

  const createMutation = useMutation({
    mutationFn: (payload: DisponibilidadeProfissionalRequest) => criarDisponibilidade(requireToken(token), payload),
    onMutate: () => {
      setFeedback(null);
    },
    onSuccess: async () => {
      await refreshDisponibilidades(queryClient);
      await disponibilidadesQuery.refetch();
      setEditingDisponibilidade(null);
      setFormKey((current) => current + 1);
      setFeedback({
        tone: 'success',
        title: 'Horario adicionado',
        message: 'Sua disponibilidade semanal foi atualizada com sucesso.',
      });
    },
    onError: handleMutationError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: DisponibilidadeProfissionalRequest }) =>
      atualizarDisponibilidade(requireToken(token), id, payload),
    onMutate: () => {
      setFeedback(null);
    },
    onSuccess: async () => {
      await refreshDisponibilidades(queryClient);
      await disponibilidadesQuery.refetch();
      setEditingDisponibilidade(null);
      setFormKey((current) => current + 1);
      setFeedback({
        tone: 'success',
        title: 'Horario atualizado',
        message: 'As alteracoes da sua agenda semanal foram salvas.',
      });
    },
    onError: handleMutationError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => excluirDisponibilidade(requireToken(token), id),
    onMutate: (id) => {
      setDeletingDisponibilidadeId(id);
      setFeedback(null);
    },
    onSuccess: async () => {
      await refreshDisponibilidades(queryClient);
      await disponibilidadesQuery.refetch();
      setEditingDisponibilidade(null);
      setFormKey((current) => current + 1);
      setFeedback({
        tone: 'success',
        title: 'Horario removido',
        message: 'Sua agenda semanal foi atualizada.',
      });
    },
    onError: handleMutationError,
    onSettled: () => {
      setDeletingDisponibilidadeId(null);
    },
  });

  function handleMutationError(error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      logout();
      navigate('/entrar', { replace: true });
      return;
    }

    setFeedback({
      tone: 'error',
      title: buildMutationErrorTitle(error),
      message: buildMutationErrorMessage(error),
      details: error instanceof ApiError ? error.errors : [],
    });
  }

  const disponibilidades = disponibilidadesQuery.data ?? [];
  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const totalAtivas = disponibilidades.filter((item) => item.ativo).length;

  return (
    <div className="grid gap-4">
      <section className="rounded-[1.75rem] border border-cyan-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Disponibilidade</p>
        <h2 className="mt-3 text-2xl font-black text-slate-900">Agenda semanal</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Cadastre os dias e horarios em que voce costuma atender. A elegibilidade continua sendo calculada pelo backend.
        </p>
      </section>

      {feedback && <FormAlert tone={feedback.tone} title={feedback.title} message={feedback.message} details={feedback.details} />}

      <section className="grid gap-3 sm:grid-cols-2">
        <SummaryCard
          label="Horarios cadastrados"
          value={disponibilidadesQuery.isLoading ? 'Carregando...' : `${disponibilidades.length}`}
        />
        <SummaryCard
          label="Faixas ativas"
          value={disponibilidadesQuery.isLoading ? 'Carregando...' : `${totalAtivas}`}
        />
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-black text-slate-900">
          {editingDisponibilidade ? 'Editar horario' : 'Adicionar horario'}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Informe o dia da semana, o intervalo de atendimento e se essa faixa deve ficar ativa.
        </p>

        <div className="mt-5 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4">
          <DisponibilidadeForm
            key={`${editingDisponibilidade?.id ?? 'nova'}-${formKey}`}
            initialDisponibilidade={editingDisponibilidade}
            isSubmitting={isMutating}
            onCancel={
              editingDisponibilidade
                ? () => {
                    if (isMutating) {
                      return;
                    }

                    setEditingDisponibilidade(null);
                    setFormKey((current) => current + 1);
                  }
                : undefined
            }
            onSubmit={handleSubmit}
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-900">Seus horarios</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Revise sua agenda atual e ajuste cada faixa quando precisar.
            </p>
          </div>
        </div>

        <div className="mt-5">
          {disponibilidadesQuery.isLoading && (
            <StateBox
              tone="loading"
              title="Carregando agenda"
              description="Buscando seus horarios semanais cadastrados."
              className="rounded-[1.5rem]"
            />
          )}

          {disponibilidadesQuery.isError && !protectedError && (
            <FormAlert
              tone="error"
              title="Nao foi possivel carregar a agenda"
              message={getApiErrorMessage(disponibilidadesQuery.error)}
              details={disponibilidadesQuery.error instanceof ApiError ? disponibilidadesQuery.error.errors : []}
            />
          )}

          {disponibilidadesQuery.isSuccess && disponibilidades.length === 0 && (
            <StateBox
              tone="empty"
              title="Nenhum horario cadastrado"
              description="Adicione sua primeira faixa de disponibilidade para organizar sua agenda semanal."
              className="rounded-[1.5rem]"
            />
          )}

          {disponibilidades.length > 0 && (
            <DisponibilidadeList
              disponibilidades={disponibilidades}
              deletingId={deletingDisponibilidadeId}
              disableActions={isMutating}
              onDelete={(disponibilidade) => {
                if (isMutating) {
                  return;
                }

                if (window.confirm('Excluir este horario de disponibilidade?')) {
                  deleteMutation.mutate(disponibilidade.id);
                }
              }}
              onEdit={(disponibilidade) => {
                if (isMutating) {
                  return;
                }

                setFeedback(null);
                setEditingDisponibilidade(disponibilidade);
              }}
            />
          )}
        </div>
      </section>

      <div className="grid gap-3">
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
          to="/profissional/app/regioes"
        >
          Ajustar regioes atendidas
        </Link>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
          to="/app/profissional/disponibilidade"
        >
          Abrir configuracao completa atual
        </Link>
      </div>
    </div>
  );

  async function handleSubmit(payload: DisponibilidadeProfissionalRequest) {
    if (isMutating) {
      return;
    }

    if (editingDisponibilidade) {
      await updateMutation.mutateAsync({ id: editingDisponibilidade.id, payload });
      return;
    }

    await createMutation.mutateAsync(payload);
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

async function refreshDisponibilidades(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.disponibilidades });
}

function buildMutationErrorTitle(error: unknown) {
  if (error instanceof ApiError && error.status === 403) {
    return 'Voce nao pode alterar esta agenda';
  }

  return 'Nao foi possivel salvar a agenda';
}

function buildMutationErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 403) {
    return 'Voce nao tem permissao para atualizar sua disponibilidade.';
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
