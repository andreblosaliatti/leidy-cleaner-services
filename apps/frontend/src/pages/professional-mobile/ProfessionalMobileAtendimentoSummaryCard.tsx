import { Link } from 'react-router-dom';

import {
  getAtendimentoClienteLabel,
  getAtendimentoEnderecoLabel,
  getAtendimentoRegiaoLabel,
} from '../../features/atendimentos/atendimentoDisplay';
import { formatCurrency, formatDateTime, getTipoServicoAtendimentoLabel } from '../../features/atendimentos/atendimentoLabels';
import { AtendimentoStatusBadge } from '../../features/atendimentos/AtendimentoStatusBadge';
import type { AtendimentoVisivel } from '../../features/atendimentos/types';
import {
  getQuickAttendanceAction,
  getQuickStartBlockedMessage,
  isQuickStartBlockedBySchedule,
  type AttendanceAction,
} from './professionalMobileActions';

export function ProfessionalMobileAtendimentoSummaryCard({
  atendimento,
  isActionDisabled,
  pendingAction,
  onQuickAction,
}: {
  atendimento: AtendimentoVisivel;
  isActionDisabled: boolean;
  pendingAction: AttendanceAction | null;
  onQuickAction: (atendimento: AtendimentoVisivel, action: AttendanceAction) => void;
}) {
  const quickAction = getQuickAttendanceAction(atendimento);
  const isStartBlocked = quickAction === 'iniciar' && isQuickStartBlockedBySchedule(atendimento);
  const actionLabel = quickAction === 'iniciar' ? 'Iniciar' : quickAction === 'finalizar' ? 'Finalizar' : null;
  const isActionPending = pendingAction !== null;

  return (
    <article className="min-w-0 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-slate-500">Atendimento #{atendimento.id}</p>
          <h3 className="mt-2 break-words text-base font-black leading-6 text-slate-900">{getTipoServicoAtendimentoLabel(atendimento.tipoServico)}</h3>
        </div>
        <AtendimentoStatusBadge status={atendimento.status} />
      </div>

      <div className="mt-4 grid min-w-0 gap-3 text-sm leading-5 text-slate-600">
        <MobileMeta label="Cliente" value={getAtendimentoClienteLabel(atendimento)} />
        <MobileMeta label="Início previsto" value={formatDateTime(atendimento.inicioPrevistoEm)} />
        <MobileMeta label="Região" value={getAtendimentoRegiaoLabel(atendimento)} />
        <MobileMeta label="Endereço" value={getAtendimentoEnderecoLabel(atendimento)} />
        <MobileMeta label="Valor estimado para você" value={formatCurrency(atendimento.valorEstimadoProfissional)} />
        {atendimento.inicioRealEm && <MobileMeta label="Início real" value={formatDateTime(atendimento.inicioRealEm)} />}
        {atendimento.fimRealEm && <MobileMeta label="Fim real" value={formatDateTime(atendimento.fimRealEm)} />}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <span className="inline-flex min-h-10 items-center justify-center rounded-2xl bg-slate-100 px-3 text-[0.68rem] font-black uppercase tracking-[0.08em] text-slate-600">
          Consulta mobile
        </span>

        {isStartBlocked && <p className="text-sm leading-6 text-amber-700">{getQuickStartBlockedMessage()}</p>}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {quickAction && (
            <button
              className={[
                'inline-flex min-h-11 w-full items-center justify-center rounded-2xl px-4 text-sm font-black text-white transition sm:w-auto',
                quickAction === 'finalizar' ? 'bg-slate-900 hover:bg-slate-800' : 'bg-cyan-700 hover:bg-cyan-800',
                (isActionDisabled || isStartBlocked) ? 'cursor-not-allowed bg-slate-300 text-slate-600 hover:bg-slate-300' : '',
              ].join(' ')}
              disabled={isActionDisabled || isStartBlocked}
              type="button"
              onClick={() => onQuickAction(atendimento, quickAction)}
            >
              {isActionPending ? `${actionLabel}...` : actionLabel}
            </button>
          )}
          <Link
            className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 sm:w-auto"
            to={`/profissional/app/atendimentos/${atendimento.id}`}
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
