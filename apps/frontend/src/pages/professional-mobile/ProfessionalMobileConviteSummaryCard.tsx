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

export function ProfessionalMobileConviteSummaryCard({
  convite,
  isAcceptDisabled,
  isAccepting,
  onAccept,
}: {
  convite: ConviteProfissional;
  isAcceptDisabled: boolean;
  isAccepting: boolean;
  onAccept: (conviteId: number) => void;
}) {
  const statusEfetivo = getStatusConviteEfetivo(convite);
  const isAtivo = isConviteAtivo(convite);

  return (
    <article className="min-w-0 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-slate-500">Convite #{convite.conviteId}</p>
          <h3 className="mt-2 break-words text-base font-black leading-6 text-slate-900">{getTipoServicoLabel(convite.tipoServico)}</h3>
        </div>
        <ConviteStatusBadge status={statusEfetivo} />
      </div>

      <div className="mt-4 grid min-w-0 gap-3 text-sm leading-5 text-slate-600">
        <MobileMeta label="Data e hora" value={formatDateTime(convite.dataHoraDesejada)} />
        <MobileMeta label="Região" value={formatInviteLocation(convite)} />
        <MobileMeta label="Duração estimada" value={`${convite.duracaoEstimadaHoras} hora${convite.duracaoEstimadaHoras === 1 ? '' : 's'}`} />
        <MobileMeta label="Valor estimado para você" value={formatCurrency(Number(convite.valorEstimadoProfissional))} />
        <MobileMeta label="Expira em" value={formatDateTime(convite.expiraEm)} />
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <span
          className={[
            'inline-flex min-h-10 items-center justify-center rounded-2xl px-3 text-[0.68rem] font-black uppercase tracking-[0.08em]',
            isAtivo ? 'bg-cyan-50 text-cyan-700' : 'bg-slate-100 text-slate-600',
          ].join(' ')}
        >
          {isAtivo ? 'Resposta pendente' : 'Somente consulta'}
        </span>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {isAtivo && (
            <button
              className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-cyan-700 px-4 text-sm font-black text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 sm:w-auto"
              disabled={isAcceptDisabled}
              type="button"
              onClick={() => onAccept(convite.conviteId)}
            >
              {isAccepting ? 'Aceitando...' : 'Aceitar'}
            </button>
          )}
          <Link
            className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 sm:w-auto"
            to={`/profissional/app/convites/${convite.conviteId}`}
          >
            Detalhes
          </Link>
        </div>
      </div>
    </article>
  );
}

function MobileMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 break-words whitespace-normal text-sm font-semibold leading-5 text-slate-800">{value}</p>
    </div>
  );
}
