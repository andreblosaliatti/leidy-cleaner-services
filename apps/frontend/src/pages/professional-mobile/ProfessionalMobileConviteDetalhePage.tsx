import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
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
import { buscarConvite } from '../../features/profissional/convites/convitesApi';
import type { ConviteProfissional } from '../../features/profissional/convites/types';
import { ApiError, getApiErrorMessage } from '../../services/apiClient';

const queryKeys = {
  detalhe: (id: number) => ['profissional', 'convites', 'mobile', id],
};

export function ProfessionalMobileConviteDetalhePage() {
  const { id } = useParams();
  const conviteId = Number(id);
  const validId = Number.isFinite(conviteId) && conviteId > 0;
  const { token, logout } = useAuth();
  const navigate = useNavigate();

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
          Este slice mobile mostra somente consulta segura dos dados disponiveis no backend atual. As acoes de aceitar e recusar entram no proximo passo de M2.
        </p>
      </section>

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

      {conviteQuery.data && <ProfessionalMobileConviteDetailCard convite={conviteQuery.data} />}

      <MobileBackLink />
    </div>
  );
}

function ProfessionalMobileConviteDetailCard({ convite }: { convite: ConviteProfissional }) {
  const statusEfetivo = getStatusConviteEfetivo(convite);
  const isAtivo = isConviteAtivo(convite);

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

      <div className="mt-5 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Acoes</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {isAtivo
            ? 'Aceitar e recusar convite ainda nao fazem parte deste primeiro slice de M2. Nesta etapa, a tela mobile esta focada em listagem e consulta detalhada.'
            : 'Este convite esta em modo somente leitura neste slice mobile. As regras de resposta continuam protegidas no backend.'}
        </p>
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
      to="/profissional/app/convites"
    >
      Voltar para convites
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
