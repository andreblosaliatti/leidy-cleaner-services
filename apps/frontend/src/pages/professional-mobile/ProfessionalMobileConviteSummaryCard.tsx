import { Link } from 'react-router-dom';

import { ConviteStatusBadge } from '../../features/profissional/convites/ConviteStatusBadge';
import {
  formatCurrency,
  formatDateTime,
  formatInviteLocation,
  getStatusConviteEfetivo,
  getTipoServicoLabel,
  isConviteAtivo,
} from '../../features/profissional/convites/conviteLabels';
import type { ConviteProfissional } from '../../features/profissional/convites/types';

export function ProfessionalMobileConviteSummaryCard({ convite }: { convite: ConviteProfissional }) {
  const statusEfetivo = getStatusConviteEfetivo(convite);
  const isAtivo = isConviteAtivo(convite);

  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Convite #{convite.conviteId}</p>
          <h3 className="mt-2 text-lg font-black text-slate-900">{getTipoServicoLabel(convite.tipoServico)}</h3>
        </div>
        <ConviteStatusBadge status={statusEfetivo} />
      </div>

      <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-600">
        <MobileMeta label="Data e hora" value={formatDateTime(convite.dataHoraDesejada)} />
        <MobileMeta label="Regiao" value={formatInviteLocation(convite)} />
        <MobileMeta label="Duracao estimada" value={`${convite.duracaoEstimadaHoras} hora${convite.duracaoEstimadaHoras === 1 ? '' : 's'}`} />
        <MobileMeta label="Valor estimado para voce" value={formatCurrency(Number(convite.valorEstimadoProfissional))} />
        <MobileMeta label="Expira em" value={formatDateTime(convite.expiraEm)} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span
          className={[
            'inline-flex min-h-10 items-center rounded-2xl px-3 text-xs font-black uppercase tracking-[0.1em]',
            isAtivo ? 'bg-cyan-50 text-cyan-700' : 'bg-slate-100 text-slate-600',
          ].join(' ')}
        >
          {isAtivo ? 'Resposta pendente' : 'Somente consulta'}
        </span>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
          to={`/profissional/app/convites/${convite.conviteId}`}
        >
          Ver detalhes
        </Link>
      </div>
    </article>
  );
}

function MobileMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.7rem] font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
