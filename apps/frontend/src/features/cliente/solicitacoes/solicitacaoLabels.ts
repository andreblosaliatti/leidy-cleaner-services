import type { StatusSolicitacao, TipoServico } from './types';

export const tipoServicoOptions: Array<{ value: TipoServico; label: string }> = [
  { value: 'FAXINA_RESIDENCIAL', label: 'Faxina residencial' },
  { value: 'FAXINA_COMERCIAL', label: 'Faxina comercial' },
  { value: 'FAXINA_CONDOMINIO', label: 'Faxina de condomínio' },
  { value: 'FAXINA_EVENTO', label: 'Faxina para evento' },
];

export const statusSolicitacaoLabels: Record<StatusSolicitacao, string> = {
  CRIADA: 'Criada',
  AGUARDANDO_SELECAO: 'Aguardando seleção',
  CONVITES_ENVIADOS: 'Convites enviados',
  AGUARDANDO_ACEITE: 'Aguardando aceite',
  ACEITA: 'Aceita',
  PAGA: 'Paga',
  EM_EXECUCAO: 'Em execução',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
  EXPIRADA: 'Expirada',
};

export function getTipoServicoLabel(tipoServico: TipoServico) {
  return tipoServicoOptions.find((option) => option.value === tipoServico)?.label ?? tipoServico;
}

export function getStatusSolicitacaoInfo(status: StatusSolicitacao) {
  const classNameByStatus: Record<StatusSolicitacao, string> = {
    CRIADA: 'bg-slate-100 text-slate-700',
    AGUARDANDO_SELECAO: 'bg-amber-50 text-amber-800',
    CONVITES_ENVIADOS: 'bg-blue-50 text-blue-800',
    AGUARDANDO_ACEITE: 'bg-blue-50 text-blue-800',
    ACEITA: 'bg-green-50 text-green-700',
    PAGA: 'bg-green-50 text-green-700',
    EM_EXECUCAO: 'bg-purple-50 text-purple-800',
    FINALIZADA: 'bg-slate-100 text-slate-700',
    CANCELADA: 'bg-red-50 text-red-700',
    EXPIRADA: 'bg-red-50 text-red-700',
  };

  return {
    label: statusSolicitacaoLabels[status],
    className: classNameByStatus[status],
  };
}

export function canRequestCancellation(status: StatusSolicitacao) {
  return ['CRIADA', 'AGUARDANDO_SELECAO', 'CONVITES_ENVIADOS', 'AGUARDANDO_ACEITE'].includes(status);
}

export function canSelectProfessionals(status: StatusSolicitacao) {
  return ['CRIADA', 'AGUARDANDO_SELECAO'].includes(status);
}
