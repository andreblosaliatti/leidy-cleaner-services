import { Link } from 'react-router-dom';

import { getSolicitacaoEnderecoLabel, getSolicitacaoRegiaoLabel } from './solicitacaoDisplay';
import {
  canRequestCancellation,
  canSelectProfessionals,
  getStatusSolicitacaoInfo,
  getTipoServicoLabel,
} from './solicitacaoLabels';
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
        selected ? 'border-cyan-200 ring-2 ring-cyan-100' : 'border-slate-100 hover:border-cyan-100',
      ].join(' ')}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-black text-slate-900">Solicitacao #{solicitacao.id}</h2>
            <span className={`rounded-lg px-3 py-1 text-xs font-black uppercase tracking-[0.1em] ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-700">{getTipoServicoLabel(solicitacao.tipoServico)}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {formatDateTime(solicitacao.dataHoraDesejada)} - {solicitacao.duracaoEstimadaHoras}h estimadas
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{getSolicitacaoEnderecoLabel(solicitacao, contexto)}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            {getSolicitacaoRegiaoLabel(solicitacao, contexto)}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap lg:w-auto lg:justify-end">
          <button
            className="min-h-10 rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
            type="button"
            onClick={() => onSelect(solicitacao)}
          >
            Detalhes
          </button>
          {canSelectProfessionals(solicitacao.status) && (
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-cyan-700 px-4 text-sm font-black text-white transition hover:bg-cyan-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
              to={`/app/cliente/solicitacoes/${solicitacao.id}/profissionais`}
            >
              Selecionar profissionais
            </Link>
          )}
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
