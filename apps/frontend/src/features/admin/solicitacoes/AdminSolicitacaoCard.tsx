import { Link } from 'react-router-dom';

import { getTipoServicoLabel } from '../../cliente/solicitacoes/solicitacaoLabels';
import {
  getSolicitacaoClienteLabel,
  getSolicitacaoEnderecoLabel,
  getSolicitacaoRegiaoLabel,
} from '../../cliente/solicitacoes/solicitacaoDisplay';
import type { SolicitacaoFaxina } from '../../cliente/solicitacoes/types';
import { formatCurrency, formatDateTime, formatPercent } from './solicitacaoAdminLabels';
import { SolicitacaoAdminStatusBadge } from './SolicitacaoAdminStatusBadge';

export function AdminSolicitacaoCard({ solicitacao }: { solicitacao: SolicitacaoFaxina }) {
  return (
    <article className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm transition hover:border-cyan-100">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-black text-slate-900">Solicitação #{solicitacao.id}</h2>
            <SolicitacaoAdminStatusBadge status={solicitacao.status} />
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-700">{getTipoServicoLabel(solicitacao.tipoServico)}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {formatDateTime(solicitacao.dataHoraDesejada)} · {solicitacao.duracaoEstimadaHoras}h estimadas
          </p>
        </div>

        <Link
          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
          to={`/app/admin/solicitacoes/${solicitacao.id}`}
        >
          Ver detalhes
        </Link>
      </div>

      <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Cliente" value={getSolicitacaoClienteLabel(solicitacao)} />
        <DetailItem label="Endereço" value={getSolicitacaoEnderecoLabel(solicitacao)} />
        <DetailItem label="Bairro/região" value={getSolicitacaoRegiaoLabel(solicitacao)} />
        <DetailItem label="Valor" value={formatCurrency(solicitacao.valorServico)} />
        <DetailItem label="Comissão" value={formatPercent(solicitacao.percentualComissaoAgencia)} />
        <DetailItem label="Valor profissional" value={formatCurrency(solicitacao.valorEstimadoProfissional)} />
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
