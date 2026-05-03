import type { DiaSemana, DisponibilidadeProfissional } from '../perfil/types';

export const DIA_SEMANA_VALUES: [DiaSemana, ...DiaSemana[]] = [
  'SEGUNDA',
  'TERCA',
  'QUARTA',
  'QUINTA',
  'SEXTA',
  'SABADO',
  'DOMINGO',
];

export const DIA_SEMANA_LABELS: Record<DiaSemana, string> = {
  SEGUNDA: 'Segunda-feira',
  TERCA: 'Terça-feira',
  QUARTA: 'Quarta-feira',
  QUINTA: 'Quinta-feira',
  SEXTA: 'Sexta-feira',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
};

export const DIA_SEMANA_OPTIONS = DIA_SEMANA_VALUES.map((value) => ({
  value,
  label: DIA_SEMANA_LABELS[value],
}));

export function getDiaSemanaLabel(diaSemana: DiaSemana) {
  return DIA_SEMANA_LABELS[diaSemana] ?? diaSemana;
}

export function formatDisponibilidadeTime(value: string) {
  return value.slice(0, 5);
}

export function formatDisponibilidadeTimeRange(
  disponibilidade: Pick<DisponibilidadeProfissional, 'horaInicio' | 'horaFim'>,
) {
  return `${formatDisponibilidadeTime(disponibilidade.horaInicio)} às ${formatDisponibilidadeTime(disponibilidade.horaFim)}`;
}

export function formatDisponibilidadeLabel(
  disponibilidade: Pick<DisponibilidadeProfissional, 'diaSemana' | 'horaInicio' | 'horaFim'>,
) {
  return `${getDiaSemanaLabel(disponibilidade.diaSemana)}, ${formatDisponibilidadeTimeRange(disponibilidade)}`;
}

export function sortDisponibilidades<T extends Pick<DisponibilidadeProfissional, 'diaSemana' | 'horaInicio' | 'horaFim'>>(
  disponibilidades: T[],
) {
  return [...disponibilidades].sort(compareDisponibilidades);
}

function compareDisponibilidades(
  first: Pick<DisponibilidadeProfissional, 'diaSemana' | 'horaInicio' | 'horaFim'>,
  second: Pick<DisponibilidadeProfissional, 'diaSemana' | 'horaInicio' | 'horaFim'>,
) {
  const dayDifference = getDiaSemanaOrder(first.diaSemana) - getDiaSemanaOrder(second.diaSemana);

  if (dayDifference !== 0) {
    return dayDifference;
  }

  const startDifference = first.horaInicio.localeCompare(second.horaInicio);

  if (startDifference !== 0) {
    return startDifference;
  }

  return first.horaFim.localeCompare(second.horaFim);
}

function getDiaSemanaOrder(diaSemana: DiaSemana) {
  const index = DIA_SEMANA_VALUES.indexOf(diaSemana);
  return index === -1 ? DIA_SEMANA_VALUES.length : index;
}
