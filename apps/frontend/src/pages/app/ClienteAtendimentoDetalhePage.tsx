import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { FormAlert } from '../../components/ui/FormAlert';
import { AtendimentoInfoPanel } from '../../features/atendimentos/AtendimentoInfoPanel';
import { buscarAtendimento, listarCheckpointsAtendimento } from '../../features/atendimentos/atendimentosApi';
import { CheckpointsList } from '../../features/atendimentos/CheckpointsList';
import { useAuth } from '../../features/auth/useAuth';
import { ApiError, getApiErrorMessage } from '../../services/apiClient';

const queryKeys = {
  detalhe: (id: number) => ['atendimentos', 'cliente', id],
  checkpoints: (id: number) => ['atendimentos', 'cliente', id, 'checkpoints'],
};

export function ClienteAtendimentoDetalhePage() {
  const { id } = useParams();
  const atendimentoId = Number(id);
  const validId = Number.isFinite(atendimentoId) && atendimentoId > 0;
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const atendimentoQuery = useQuery({
    queryKey: validId ? queryKeys.detalhe(atendimentoId) : ['atendimentos', 'cliente', 'invalid'],
    queryFn: () => buscarAtendimento(requireToken(token), atendimentoId),
    enabled: Boolean(token && validId),
  });

  const checkpointsQuery = useQuery({
    queryKey: validId ? queryKeys.checkpoints(atendimentoId) : ['atendimentos', 'cliente', 'invalid', 'checkpoints'],
    queryFn: () => listarCheckpointsAtendimento(requireToken(token), atendimentoId),
    enabled: Boolean(token && validId),
  });

  const protectedError = useMemo(
    () =>
      [atendimentoQuery.error, checkpointsQuery.error].find((error) => error instanceof ApiError && error.status === 401),
    [atendimentoQuery.error, checkpointsQuery.error],
  );

  useEffect(() => {
    if (protectedError) {
      logout();
      navigate('/entrar', { replace: true });
    }
  }, [logout, navigate, protectedError]);

  if (!validId) {
    return (
      <div className="grid gap-5">
        <FormAlert tone="error" title="Atendimento inválido" message="O identificador do atendimento não é válido." />
        <Link className="font-black text-green-700 hover:text-green-800" to="/app/cliente/atendimentos">
          Voltar para atendimentos
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-green-100 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-green-700">Cliente</p>
            <h1 className="mt-3 text-3xl font-black tracking-normal text-slate-900 md:text-4xl">Detalhe do atendimento</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              Acompanhe o status operacional e os checkpoints registrados pela profissional.
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-green-100 px-5 text-sm font-black text-green-700 transition hover:bg-green-50"
            to="/app/cliente/atendimentos"
          >
            Voltar
          </Link>
        </div>
      </section>

      {atendimentoQuery.isLoading && <StateBox title="Carregando atendimento" description="Buscando os dados do atendimento." />}

      {atendimentoQuery.isError && !protectedError && (
        <FormAlert
          tone="error"
          title="Não foi possível carregar o atendimento"
          message={getApiErrorMessage(atendimentoQuery.error)}
          details={atendimentoQuery.error instanceof ApiError ? atendimentoQuery.error.errors : []}
        />
      )}

      {atendimentoQuery.data && <AtendimentoInfoPanel atendimento={atendimentoQuery.data} />}

      <section className="grid gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Checkpoints</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Registros de início e fim retornados pelo backend.</p>
        </div>

        {checkpointsQuery.isLoading && <StateBox title="Carregando checkpoints" description="Buscando registros do atendimento." />}

        {checkpointsQuery.isError && !protectedError && (
          <FormAlert
            tone="error"
            title="Não foi possível carregar checkpoints"
            message={getApiErrorMessage(checkpointsQuery.error)}
            details={checkpointsQuery.error instanceof ApiError ? checkpointsQuery.error.errors : []}
          />
        )}

        {checkpointsQuery.data && <CheckpointsList checkpoints={checkpointsQuery.data} />}
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
