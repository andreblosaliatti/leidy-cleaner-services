import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { FormAlert } from '../../components/ui/FormAlert';
import { AprovacaoProfissionalForm } from '../../features/admin/profissionais/AprovacaoProfissionalForm';
import {
  analisarProfissionalAdmin,
  listarProfissionaisAdmin,
} from '../../features/admin/profissionais/adminProfissionaisApi';
import { ProfissionalAdminCard } from '../../features/admin/profissionais/ProfissionalAdminCard';
import type { StatusAprovacaoProfissional } from '../../features/admin/profissionais/types';
import { useAuth } from '../../features/auth/useAuth';
import { ApiError, getApiErrorMessage } from '../../services/apiClient';

const queryKeys = {
  profissionais: ['admin', 'profissionais'],
};

type Feedback = {
  tone: 'error' | 'success' | 'info';
  title?: string;
  message: string;
  details?: string[];
};

export function AdminProfissionaisPage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const profissionaisQuery = useQuery({
    queryKey: queryKeys.profissionais,
    queryFn: () => listarProfissionaisAdmin(requireToken(token)),
    enabled: Boolean(token),
    retry: false,
  });

  const approvalMutation = useMutation({
    mutationFn: ({ profissionalId, statusAprovacao }: { profissionalId: number; statusAprovacao: StatusAprovacaoProfissional }) =>
      analisarProfissionalAdmin(requireToken(token), profissionalId, { statusAprovacao }),
    onSuccess: async (profissional) => {
      setFeedback({
        tone: 'success',
        title: 'Aprovação atualizada',
        message: `Status da profissional #${profissional.id} salvo como ${profissional.statusAprovacao}.`,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.profissionais });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        logout();
        navigate('/entrar', { replace: true });
        return;
      }

      setFeedback({
        tone: 'error',
        title: 'Não foi possível atualizar aprovação',
        message: getApiErrorMessage(error),
        details: error instanceof ApiError ? error.errors : [],
      });
    },
  });

  const protectedError = useMemo(
    () => (profissionaisQuery.error instanceof ApiError && profissionaisQuery.error.status === 401 ? profissionaisQuery.error : null),
    [profissionaisQuery.error],
  );

  useEffect(() => {
    if (protectedError) {
      logout();
      navigate('/entrar', { replace: true });
    }
  }, [logout, navigate, protectedError]);

  function handleAprovacaoSubmit(values: { profissionalId: number; statusAprovacao: StatusAprovacaoProfissional }) {
    setFeedback(null);
    approvalMutation.mutate(values);
  }

  const profissionais = profissionaisQuery.data ?? [];

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-green-100 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-green-700">Administração</p>
            <h1 className="mt-3 text-3xl font-black tracking-normal text-slate-900 md:text-4xl">Profissionais</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              Acompanhe perfis profissionais e altere o status de aprovação pelo backend quando o perfil for conhecido.
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-green-100 px-5 text-sm font-black text-green-700 transition hover:bg-green-50"
            to="/app/admin"
          >
            Voltar
          </Link>
        </div>
      </section>

      {feedback && <FormAlert tone={feedback.tone} title={feedback.title} message={feedback.message} details={feedback.details} />}

      <section className="grid gap-4 rounded-lg border border-slate-100 bg-white p-5 shadow-sm md:p-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Aprovação por ID</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            O backend atual expõe a ação de aprovação por ID do perfil profissional.
          </p>
        </div>
        <AprovacaoProfissionalForm isSubmitting={approvalMutation.isPending} onSubmit={handleAprovacaoSubmit} />
      </section>

      <section className="grid gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Listagem de profissionais</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Esta área usa o contrato `GET /api/v1/profissionais` quando disponível.</p>
        </div>

        {profissionaisQuery.isLoading && <StateBox title="Carregando profissionais" description="Buscando perfis profissionais." />}

        {profissionaisQuery.isError && !protectedError && (
          <div className="grid gap-3">
            <FormAlert
              tone="error"
              title="Não foi possível carregar profissionais"
              message={getApiErrorMessage(profissionaisQuery.error)}
              details={profissionaisQuery.error instanceof ApiError ? profissionaisQuery.error.errors : []}
            />
            <FormAlert
              tone="info"
              title="Contrato incompleto no backend atual"
              message="A auditoria local encontrou PATCH /profissionais/{id}/aprovacao, mas não encontrou GET /profissionais no controller."
            />
          </div>
        )}

        {profissionaisQuery.isSuccess && profissionais.length === 0 && (
          <StateBox title="Nenhuma profissional encontrada" description="O backend retornou uma lista vazia." />
        )}

        {profissionais.length > 0 && (
          <div className="grid gap-4">
            {profissionais.map((profissional) => (
              <ProfissionalAdminCard
                key={profissional.id}
                profissional={profissional}
                isSubmitting={approvalMutation.isPending}
                onSubmitAprovacao={handleAprovacaoSubmit}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StateBox({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-6 text-center shadow-sm">
      <h3 className="font-black text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
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
