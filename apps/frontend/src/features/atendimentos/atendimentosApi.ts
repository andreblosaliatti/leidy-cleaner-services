import { apiRequest } from '../../services/apiClient';
import type { AtendimentoFaxinaProfissional, AtendimentoVisivel, CheckpointServico, CheckpointServicoRequest } from './types';

export function listarMeusAtendimentos(token: string) {
  return apiRequest<AtendimentoVisivel[]>('/atendimentos/meus', {
    method: 'GET',
    token,
  });
}

export function buscarAtendimento(token: string, atendimentoId: number) {
  return apiRequest<AtendimentoVisivel>(`/atendimentos/${atendimentoId}`, {
    method: 'GET',
    token,
  });
}

export function listarCheckpointsAtendimento(token: string, atendimentoId: number) {
  return apiRequest<CheckpointServico[]>(`/atendimentos/${atendimentoId}/checkpoints`, {
    method: 'GET',
    token,
  });
}

export function iniciarAtendimento(token: string, atendimentoId: number, payload: CheckpointServicoRequest) {
  return apiRequest<AtendimentoFaxinaProfissional>(`/atendimentos/${atendimentoId}/iniciar`, {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export function finalizarAtendimento(token: string, atendimentoId: number, payload: CheckpointServicoRequest) {
  return apiRequest<AtendimentoFaxinaProfissional>(`/atendimentos/${atendimentoId}/finalizar`, {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}
