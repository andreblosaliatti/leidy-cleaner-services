export const notaAvaliacaoOptions = [1, 2, 3, 4, 5] as const;

export function isValidNotaAvaliacao(nota: number | null): nota is number {
  return nota !== null && Number.isInteger(nota) && nota >= 1 && nota <= 5;
}

export function formatNotaAvaliacao(nota: number) {
  return `${nota}/5`;
}

export function formatAvaliacaoDateTime(value: string | null | undefined) {
  if (!value) {
    return 'Não informado';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}
