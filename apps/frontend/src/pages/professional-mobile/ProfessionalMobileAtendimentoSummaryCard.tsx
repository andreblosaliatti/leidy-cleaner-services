import { Link } from 'react-router-dom';

import {
  getAtendimentoClienteLabel,
  getAtendimentoEnderecoLabel,
  getAtendimentoRegiaoLabel,
} from '../../features/atendimentos/atendimentoDisplay';
import { formatCurrency, formatDateTime, getTipoServicoAtendimentoLabel } from '../../features/atendimentos/atendimentoLabels';
import { AtendimentoStatusBadge } from '../../features/atendimentos/AtendimentoStatusBadge';
import type { AtendimentoVisivel } from '../../features/atendimentos/types';

export function ProfessionalMobileAtendimentoSummaryCard({ atendimento }: { atendimento: AtendimentoVisivel }) {
  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Atendimento #{atendimento.id}</p>
          <h3 className="mt-2 text-lg font-black text-slate-900">{getTipoServicoAtendimentoLabel(atendimento.tipoServico)}</h3>
        </div>
        <AtendimentoStatusBadge status={atendimento.status} />
      </div>

      <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-600">
        <MobileMeta label="Cliente" value={getAtendimentoClienteLabel(atendimento)} />
        <MobileMeta label="Inicio previsto" value={formatDateTime(atendimento.inicioPrevistoEm)} />
        <MobileMeta label="Regiao" value={getAtendimentoRegiaoLabel(atendimento)} />
        <MobileMeta label="Endereco" value={getAtendimentoEnderecoLabel(atendimento)} />
        <MobileMeta label="Valor estimado para voce" value={formatCurrency(atendimento.valorEstimadoProfissional)} />
        {atendimento.inicioRealEm && <MobileMeta label="Inicio real" value={formatDateTime(atendimento.inicioRealEm)} />}
        {atendimento.fimRealEm && <MobileMeta label="Fim real" value={formatDateTime(atendimento.fimRealEm)} />}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="inline-flex min-h-10 items-center rounded-2xl bg-slate-100 px-3 text-xs font-black uppercase tracking-[0.1em] text-slate-600">
          Consulta mobile
        </span>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
          to={`/profissional/app/atendimentos/${atendimento.id}`}
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
