import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
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
  listarCheckpointsAtendimento,
} from '../../features/atendimentos/atendimentosApi';
import { formatCurrency, formatDateTime, getTipoServicoAtendimentoLabel } from '../../features/atendimentos/atendimentoLabels';
import { AtendimentoStatusBadge } from '../../features/atendimentos/AtendimentoStatusBadge';
import { CheckpointsList } from '../../features/atendimentos/CheckpointsList';
import type { AtendimentoVisivel } from '../../features/atendimentos/types';
import { useAuth } from '../../features/auth/useAuth';
import { ApiError, getApiErrorMessage } from '../../services/apiClient';

const queryKeys = {
  detalhe: (id: number) => ['atendimentos', 'profissional', id],
  checkpoints: (id: number) => ['atendimentos', 'profissional', id, 'checkpoints'],
};

export function ProfessionalMobileAtendimentoDetalhePage() {
  const { id } = useParams();
  const atendimentoId = Number(id);
  const validId = Number.isFinite(atendimentoId) && atendimentoId > 0;
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const atendimentoQuery = useQuery({
    queryKey: validId ? queryKeys.detalhe(atendimentoId) : ['atendimentos', 'profissional', 'mobile', 'invalid'],
    queryFn: () => buscarAtendimento(requireToken(token), atendimentoId),
    enabled: Boolean(token && validId),
  });

  const checkpointsQuery = useQuery({
    queryKey: validId ? queryKeys.checkpoints(atendimentoId) : ['atendimentos', 'profissional', 'mobile', 'invalid', 'checkpoints'],
    queryFn: () => listarCheckpointsAtendimento(requireToken(token), atendimentoId),
    enabled: Boolean(token && validId),
  });

  const protectedError = useMemo(
    () =>
      [atendimentoQuery.error, checkpointsQuery.error].find((error) => error instanceof ApiError && error.status === 401) ?? null,
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
      <div className="grid gap-4">
        <FormAlert tone="error" title="Atendimento invalido" message="O identificador informado para este atendimento nao e valido." />
        <MobileBackLink />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-[1.75rem] border border-cyan-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Atendimento</p>
        <h2 className="mt-3 text-2xl font-black text-slate-900">Detalhe do atendimento</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Consulte os dados do servico, os horarios registrados e os checkpoints ja enviados pelo sistema.
        </p>
      </section>

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

      {atendimentoQuery.data && <ProfessionalMobileAtendimentoDetailCard atendimento={atendimentoQuery.data} />}

      {atendimentoQuery.data && (
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
