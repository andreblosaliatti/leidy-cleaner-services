import { Link } from 'react-router-dom';

import {
  formatCurrency,
  formatDateTime,
  getTipoServicoAtendimentoLabel,
} from '../../atendimentos/atendimentoLabels';
import {
  getAtendimentoClienteLabel,
  getAtendimentoProfissionalLabel,
  getAtendimentoRegiaoLabel,
} from '../../atendimentos/atendimentoDisplay';
import { AtendimentoStatusBadge } from '../../atendimentos/AtendimentoStatusBadge';
import type { AtendimentoFaxina } from '../../atendimentos/types';

export function AdminAtendimentoCard({ atendimento }: { atendimento: AtendimentoFaxina }) {
  return (
    <article className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm transition hover:border-green-100">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-black text-slate-900">Atendimento #{atendimento.id}</h2>
            <AtendimentoStatusBadge status={atendimento.status} />
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-700">{getTipoServicoAtendimentoLabel(atendimento.tipoServico)}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Previsto para {formatDateTime(atendimento.inicioPrevistoEm)}</p>
        </div>

        <Link
          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
          to={`/app/admin/atendimentos/${atendimento.id}`}
        >
          Ver detalhes
        </Link>
      </div>

      <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Solicitação" value={`ID ${atendimento.solicitacaoId}`} />
        <DetailItem label="Cliente" value={getAtendimentoClienteLabel(atendimento)} />
        <DetailItem label="Profissional" value={getAtendimentoProfissionalLabel(atendimento)} />
        <DetailItem label="Bairro/região" value={getAtendimentoRegiaoLabel(atendimento)} />
        <DetailItem label="Valor" value={formatCurrency(atendimento.valorServico)} />
        <DetailItem label="Comissão" value={`${Number(atendimento.percentualComissaoAgencia).toLocaleString('pt-BR')}%`} />
        <DetailItem label="Valor profissional" value={formatCurrency(atendimento.valorEstimadoProfissional)} />
      </dl>
    </article>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</dt>
      <dd className="mt-1 break-words font-semibold leading-6 text-slate-800">{value}</dd>
    </div>
  );
}
