import type { StatusAprovacaoProfissional } from './types';

export const statusAprovacaoProfissionalOptions: Array<{ value: StatusAprovacaoProfissional; label: string }> = [
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'EM_ANALISE', label: 'Em análise' },
  { value: 'APROVADO', label: 'Aprovado' },
  { value: 'REJEITADO', label: 'Rejeitado' },
];

export function getStatusAprovacaoProfissionalInfo(status: StatusAprovacaoProfissional) {
  const statusInfo: Record<StatusAprovacaoProfissional, { label: string; className: string }> = {
    PENDENTE: { label: 'Pendente', className: 'bg-amber-50 text-amber-800' },
    EM_ANALISE: { label: 'Em análise', className: 'bg-blue-50 text-blue-800' },
    APROVADO: { label: 'Aprovado', className: 'bg-green-50 text-green-700' },
    REJEITADO: { label: 'Rejeitado', className: 'bg-red-50 text-red-700' },
  };

  return statusInfo[status];
}

export function formatAdminDate(value: string | null | undefined) {
  if (!value) {
    return 'Não informado';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(new Date(value));
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

export function formatRating(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return 'Não informado';
  }

  return Number(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
}
