import { canRequestCancellation, getStatusSolicitacaoInfo, getTipoServicoLabel } from './solicitacaoLabels';
import type { SolicitacaoContexto, SolicitacaoFaxina } from './types';

type SolicitacaoCardProps = {
  contexto?: SolicitacaoContexto;
  isCancelling?: boolean;
  onCancel: (solicitacao: SolicitacaoFaxina) => void;
  onSelect: (solicitacao: SolicitacaoFaxina) => void;
  selected?: boolean;
  solicitacao: SolicitacaoFaxina;
};

export function SolicitacaoCard({
  contexto,
  isCancelling = false,
  onCancel,
  onSelect,
  selected = false,
  solicitacao,
}: SolicitacaoCardProps) {
  const statusInfo = getStatusSolicitacaoInfo(solicitacao.status);

  return (
    <article
      className={[
        'rounded-lg border bg-white p-5 shadow-sm transition',
        selected ? 'border-green-200 ring-2 ring-green-100' : 'border-slate-100 hover:border-green-100',
      ].join(' ')}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-black text-slate-900">Solicitação #{solicitacao.id}</h2>
            <span className={`rounded-lg px-3 py-1 text-xs font-black uppercase tracking-[0.1em] ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-700">{getTipoServicoLabel(solicitacao.tipoServico)}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {formatDateTime(solicitacao.dataHoraDesejada)} · {solicitacao.duracaoEstimadaHoras}h estimadas
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {contexto?.endereco
              ? `${contexto.endereco.logradouro}, ${contexto.endereco.numero} - ${contexto.endereco.bairro}`
              : `Endereço #${solicitacao.enderecoId}`}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            className="min-h-10 rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
            type="button"
            onClick={() => onSelect(solicitacao)}
          >
            Detalhes
          </button>
          {canRequestCancellation(solicitacao.status) && (
            <button
              className="min-h-10 rounded-lg border border-red-100 px-4 text-sm font-black text-red-700 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:cursor-not-allowed disabled:text-slate-400"
              disabled={isCancelling}
              type="button"
              onClick={() => onCancel(solicitacao)}
            >
              {isCancelling ? 'Cancelando...' : 'Cancelar'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}
