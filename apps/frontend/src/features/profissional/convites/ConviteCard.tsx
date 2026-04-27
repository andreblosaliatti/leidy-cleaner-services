import { Link } from 'react-router-dom';

import {
  canRespondToConvite,
  formatCurrency,
  formatDateTime,
  formatInviteLocation,
  getTipoServicoLabel,
} from './conviteLabels';
import { ConviteStatusBadge } from './ConviteStatusBadge';
import type { ConviteProfissional } from './types';

export function ConviteCard({ convite }: { convite: ConviteProfissional }) {
  return (
    <article className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm transition hover:border-green-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-black text-slate-900">Convite #{convite.conviteId}</h2>
            <ConviteStatusBadge status={convite.status} />
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-700">{getTipoServicoLabel(convite.tipoServico)}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {formatDateTime(convite.dataHoraDesejada)} · {convite.duracaoEstimadaHoras}h estimadas
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {formatInviteLocation({
              bairro: convite.bairro,
              cidade: convite.cidade,
              estado: convite.estado,
            })}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-700">{formatCurrency(Number(convite.valorServico))}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            Expira em {formatDateTime(convite.expiraEm)}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {canRespondToConvite(convite.status) && (
            <span className="inline-flex min-h-10 items-center rounded-lg bg-green-50 px-3 text-xs font-black uppercase tracking-[0.1em] text-green-700">
              Resposta pendente
            </span>
          )}
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
            to={`/app/profissional/convites/${convite.conviteId}`}
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </article>
  );
}
