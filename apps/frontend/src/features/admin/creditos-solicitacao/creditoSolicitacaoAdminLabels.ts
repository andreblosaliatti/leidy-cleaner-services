import { getStatusCreditoSolicitacaoInfo } from '../../cliente/creditos/creditoSolicitacaoLabels';
import type { StatusCreditoSolicitacao } from '../../cliente/creditos/types';
import { getTipoServicoLabel } from '../../cliente/solicitacoes/solicitacaoLabels';
import type { TipoServico } from '../../cliente/solicitacoes/types';

export const statusCreditoSolicitacaoAdminLabels: Record<StatusCreditoSolicitacao, string> = {
  DISPONIVEL: 'Reposicao disponivel',
  RESERVADO: 'Reservado',
  UTILIZADO: 'Utilizado',
  CANCELADO: 'Cancelado',
  EXPIRADO: 'Expirado',
};

export function getStatusCreditoSolicitacaoAdminInfo(status: StatusCreditoSolicitacao) {
  const statusInfo = getStatusCreditoSolicitacaoInfo(status);

  return {
    ...statusInfo,
    label: statusCreditoSolicitacaoAdminLabels[status] ?? statusInfo.label,
  };
}

export function getCreditoSolicitacaoTipoServicoLabel(tipoServico: TipoServico) {
  return getTipoServicoLabel(tipoServico);
}

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return 'Nao informado';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value));
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return 'Nao informado';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatOptionalText(value: string | null | undefined) {
  return value?.trim() ? value : 'Nao informado';
}
