import { getTipoServicoLabel } from '../solicitacoes/solicitacaoLabels';
import type { SolicitacaoFaxina } from '../solicitacoes/types';
import type { CreditoSolicitacao, StatusCreditoSolicitacao } from './types';

export const statusCreditoSolicitacaoLabels: Record<StatusCreditoSolicitacao, string> = {
  DISPONIVEL: 'Disponivel',
  RESERVADO: 'Reservado',
  UTILIZADO: 'Utilizado',
  CANCELADO: 'Cancelado',
  EXPIRADO: 'Expirado',
};

export function getStatusCreditoSolicitacaoInfo(status: StatusCreditoSolicitacao) {
  const classNameByStatus: Record<StatusCreditoSolicitacao, string> = {
    DISPONIVEL: 'bg-emerald-50 text-emerald-800',
    RESERVADO: 'bg-amber-50 text-amber-800',
    UTILIZADO: 'bg-slate-100 text-slate-700',
    CANCELADO: 'bg-red-50 text-red-700',
    EXPIRADO: 'bg-red-50 text-red-700',
  };

  return {
    label: statusCreditoSolicitacaoLabels[status],
    className: classNameByStatus[status],
  };
}

export function getCreditoTipoServicoLabel(tipoServico: CreditoSolicitacao['tipoServico']) {
  return getTipoServicoLabel(tipoServico);
}

export function isCreditoSolicitacaoProvavelmenteCompativel(credito: CreditoSolicitacao, solicitacao: SolicitacaoFaxina) {
  return (
    credito.tipoServico === solicitacao.tipoServico &&
    credito.duracaoEstimadaHoras === solicitacao.duracaoEstimadaHoras &&
    credito.regiaoId === solicitacao.regiaoId
  );
}
