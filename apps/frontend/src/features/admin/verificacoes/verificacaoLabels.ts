import type { StatusVerificacao } from './types';

export const statusVerificacaoOptions: Array<{ value: StatusVerificacao; label: string }> = [
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'EM_ANALISE', label: 'Em análise' },
  { value: 'APROVADO', label: 'Aprovado' },
  { value: 'REJEITADO', label: 'Rejeitado' },
];

export function getStatusVerificacaoInfo(status: StatusVerificacao) {
  const statusInfo: Record<StatusVerificacao, { label: string; className: string }> = {
    PENDENTE: { label: 'Pendente', className: 'bg-amber-50 text-amber-800' },
    EM_ANALISE: { label: 'Em análise', className: 'bg-blue-50 text-blue-800' },
    APROVADO: { label: 'Aprovado', className: 'bg-green-50 text-green-700' },
    REJEITADO: { label: 'Rejeitado', className: 'bg-red-50 text-red-700' },
  };

  return statusInfo[status];
}

export function formatAdminDateTime(value: string | null | undefined) {
  if (!value) {
    return 'Não informado';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatOptionalText(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return 'Não informado';
  }

  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Não';
  }

  return String(value);
}
