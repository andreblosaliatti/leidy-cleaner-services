export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return 'Não informado';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value));
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return 'Não informado';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatOptionalText(value: string | null | undefined) {
  return value?.trim() ? value : 'Não informado';
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return 'Não informado';
  }

  return `${Number(value).toLocaleString('pt-BR')}%`;
}
