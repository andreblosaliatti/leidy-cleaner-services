import { Link } from 'react-router-dom';

import { getStatusSolicitacaoInfo, getTipoServicoLabel } from '../../cliente/solicitacoes/solicitacaoLabels';
import { getStatusConviteInfo, isConviteExpirado } from '../../profissional/convites/conviteLabels';
import { PagamentoAdminStatusBadge } from '../pagamentos/PagamentoAdminStatusBadge';
import { formatDateTime } from '../solicitacoes/solicitacaoAdminLabels';
import { SolicitacaoAdminStatusBadge } from '../solicitacoes/SolicitacaoAdminStatusBadge';
import type { ConviteMonitoramentoAdmin } from './types';

export function AdminConviteMonitoramentoCard({ convite }: { convite: ConviteMonitoramentoAdmin }) {
  const conviteInfo = getStatusConviteInfo(convite.statusConvite);
  const vencidoPorData = isRespondable(convite.statusConvite) && isConviteExpirado(convite.expiraEm);
  const destaqueVencido = convite.expirado || vencidoPorData;
  const aguardandoAceitePago = convite.solicitacaoStatus === 'PAGA_AGUARDANDO_ACEITE';

  return (
    <article
      className={[
        'rounded-lg border bg-white p-5 shadow-sm transition hover:border-cyan-100',
        destaqueVencido ? 'border-red-200 bg-red-50/40' : aguardandoAceitePago ? 'border-amber-200 bg-amber-50/40' : 'border-slate-100',
      ].join(' ')}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-black text-slate-900">Convite #{convite.conviteId}</h2>
            <span className={`rounded-lg px-3 py-1 text-xs font-black uppercase tracking-[0.1em] ${conviteInfo.className}`}>
              {conviteInfo.label}
            </span>
            <SolicitacaoAdminStatusBadge status={convite.solicitacaoStatus} />
            {convite.pagamentoStatus && <PagamentoAdminStatusBadge status={convite.pagamentoStatus} />}
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-700">
            Solicitacao #{convite.solicitacaoId} · Cliente ID {convite.clienteId}
            {convite.clienteNome ? ` · ${convite.clienteNome}` : ''}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Profissional ID {convite.profissionalId}
            {convite.profissionalNome ? ` · ${convite.profissionalNome}` : ''} · {getTipoServicoLabel(convite.tipoServico)} ·{' '}
            {convite.duracaoEstimadaHoras}h · {convite.regiaoNome || 'Regiao nao informada'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
            to={`/app/admin/solicitacoes/${convite.solicitacaoId}`}
          >
            Solicitacao
          </Link>
          {convite.pagamentoId && (
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
              to={`/app/admin/pagamentos/${convite.pagamentoId}`}
            >
              Pagamento
            </Link>
          )}
          {convite.creditoSolicitacaoId && (
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
              to={`/app/admin/creditos-solicitacao/${convite.creditoSolicitacaoId}`}
            >
              Credito de solicitacao
            </Link>
          )}
        </div>
      </div>

      {(destaqueVencido || aguardandoAceitePago) && (
        <div
          className={[
            'mt-4 rounded-lg px-4 py-3 text-sm font-bold',
            destaqueVencido ? 'border border-red-200 bg-red-50 text-red-900' : 'border border-amber-200 bg-amber-50 text-amber-900',
          ].join(' ')}
        >
          {destaqueVencido
            ? 'Convite vencido ou com expiracao passada. Verifique se o processamento automatico ja refletiu o credito de solicitacao.'
            : 'Solicitacao paga aguardando resposta da profissional.'}
        </div>
      )}

      <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Data desejada" value={formatDateTime(convite.dataHoraDesejada)} />
        <DetailItem label="Enviado em" value={formatDateTime(convite.enviadoEm)} />
        <DetailItem label="Respondido em" value={formatDateTime(convite.respondidoEm)} />
        <DetailItem label="Expira em" value={formatDateTime(convite.expiraEm)} />
        <DetailItem label="Pagamento" value={convite.pagamentoId ? `#${convite.pagamentoId}` : 'Nao informado'} />
        <DetailItem label="Status da solicitacao" value={getStatusSolicitacaoInfo(convite.solicitacaoStatus).label} />
        <DetailItem label="Expirado" value={convite.expirado || vencidoPorData ? 'Sim' : 'Nao'} />
        <DetailItem label="Credito de solicitacao" value={convite.creditoSolicitacaoId ? `#${convite.creditoSolicitacaoId}` : 'Nao gerado'} />
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

function isRespondable(status: ConviteMonitoramentoAdmin['statusConvite']) {
  return status === 'ENVIADO' || status === 'VISUALIZADO';
}
