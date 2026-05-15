import { Link } from 'react-router-dom';

import { CreditoSolicitacaoAdminStatusBadge } from './CreditoSolicitacaoAdminStatusBadge';
import {
  formatCurrency,
  formatDateTime,
  formatOptionalText,
  getCreditoSolicitacaoTipoServicoLabel,
} from './creditoSolicitacaoAdminLabels';
import type { AdminCreditoSolicitacaoListItem } from './types';

export function AdminCreditoSolicitacaoCard({ credito }: { credito: AdminCreditoSolicitacaoListItem }) {
  return (
    <article className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm transition hover:border-cyan-100">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-black text-slate-900">Credito de solicitacao #{credito.id}</h2>
            <CreditoSolicitacaoAdminStatusBadge status={credito.status} />
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-700">
            Cliente ID {credito.clienteId}
            {credito.clienteNome ? ` · ${credito.clienteNome}` : ''}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {getCreditoSolicitacaoTipoServicoLabel(credito.tipoServico)} · {credito.duracaoEstimadaHoras}h ·{' '}
            {credito.regiaoNome || `Regiao ID ${credito.regiaoId}`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
            to={`/app/admin/creditos-solicitacao/${credito.id}`}
          >
            Ver detalhe
          </Link>
          {credito.solicitacaoOrigemId && (
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
              to={`/app/admin/solicitacoes/${credito.solicitacaoOrigemId}`}
            >
              Solicitacao origem
            </Link>
          )}
          {credito.solicitacaoUsoId && (
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
              to={`/app/admin/solicitacoes/${credito.solicitacaoUsoId}`}
            >
              Solicitacao uso
            </Link>
          )}
          {credito.pagamentoOrigemId && (
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
              to={`/app/admin/pagamentos/${credito.pagamentoOrigemId}`}
            >
              Pagamento origem
            </Link>
          )}
        </div>
      </div>

      <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Solicitacao origem" value={credito.solicitacaoOrigemId ? `#${credito.solicitacaoOrigemId}` : 'Nao informada'} />
        <DetailItem label="Solicitacao uso" value={credito.solicitacaoUsoId ? `#${credito.solicitacaoUsoId}` : 'Nao utilizada'} />
        <DetailItem label="Pagamento origem" value={credito.pagamentoOrigemId ? `#${credito.pagamentoOrigemId}` : 'Nao informado'} />
        <DetailItem label="Valor de referencia" value={formatCurrency(credito.valorReferencia)} />
        <DetailItem label="Criado em" value={formatDateTime(credito.criadoEm)} />
        <DetailItem label="Reservado em" value={formatDateTime(credito.reservadoEm)} />
        <DetailItem label="Utilizado em" value={formatDateTime(credito.utilizadoEm)} />
        <DetailItem label="Cancelado em" value={formatDateTime(credito.canceladoEm)} />
      </dl>

      <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50 p-4">
        <h3 className="font-black text-slate-900">Observacao</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{formatOptionalText(credito.observacao)}</p>
      </div>
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
