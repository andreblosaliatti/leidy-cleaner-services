import { apiRequest } from '../../services/apiClient';
import type { AvaliacaoProfissional, AvaliacaoProfissionalRequest } from './types';

export function criarAvaliacaoProfissional(token: string, payload: AvaliacaoProfissionalRequest) {
  return apiRequest<AvaliacaoProfissional>('/avaliacoes', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export function listarAvaliacoesProfissional(token: string, profissionalId: number) {
  return apiRequest<AvaliacaoProfissional[]>(`/profissionais/${profissionalId}/avaliacoes`, {
    method: 'GET',
    token,
  });
}
