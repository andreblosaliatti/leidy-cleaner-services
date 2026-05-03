import { getTipoServicoLabel } from '../../cliente/solicitacoes/solicitacaoLabels';
import {
  getSolicitacaoClienteLabel,
  getSolicitacaoEnderecoLabel,
  getSolicitacaoRegiaoLabel,
} from '../../cliente/solicitacoes/solicitacaoDisplay';
import type { SolicitacaoFaxina } from '../../cliente/solicitacoes/types';
import { formatCurrency, formatDateTime, formatOptionalText, formatPercent } from './solicitacaoAdminLabels';
import { SolicitacaoAdminStatusBadge } from './SolicitacaoAdminStatusBadge';

export function AdminSolicitacaoInfoPanel({ solicitacao }: { solicitacao: SolicitacaoFaxina }) {
  return (
    <section className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-2xl font-black text-slate-900">Solicitação #{solicitacao.id}</h2>
        <SolicitacaoAdminStatusBadge status={solicitacao.status} />
      </div>

      <dl className="mt-6 grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-3">
        <DetailItem label="Cliente" value={getSolicitacaoClienteLabel(solicitacao)} />
        <DetailItem label="Endereço" value={getSolicitacaoEnderecoLabel(solicitacao)} />
        <DetailItem label="Bairro/região" value={getSolicitacaoRegiaoLabel(solicitacao)} />
        <DetailItem label="Tipo" value={getTipoServicoLabel(solicitacao.tipoServico)} />
        <DetailItem label="Data desejada" value={formatDateTime(solicitacao.dataHoraDesejada)} />
        <DetailItem label="Duração estimada" value={`${solicitacao.duracaoEstimadaHoras} horas`} />
        <DetailItem label="Valor do serviço" value={formatCurrency(solicitacao.valorServico)} />
        <DetailItem label="Comissão agência" value={formatPercent(solicitacao.percentualComissaoAgencia)} />
        <DetailItem label="Valor profissional" value={formatCurrency(solicitacao.valorEstimadoProfissional)} />
      </dl>

      <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50 p-4">
        <h3 className="font-black text-slate-900">Observações</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{formatOptionalText(solicitacao.observacoes)}</p>
      </div>
    </section>
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
