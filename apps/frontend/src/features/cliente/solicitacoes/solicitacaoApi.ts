import { apiRequest } from '../../../services/apiClient';
import type { RegiaoAtendimento, SolicitacaoFaxina, SolicitacaoFaxinaRequest } from './types';

export function criarSolicitacao(token: string, payload: SolicitacaoFaxinaRequest) {
  return apiRequest<SolicitacaoFaxina>('/solicitacoes', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export function listarMinhasSolicitacoes(token: string) {
  return apiRequest<SolicitacaoFaxina[]>('/solicitacoes/minhas', {
    method: 'GET',
    token,
  });
}

export function buscarSolicitacao(token: string, solicitacaoId: number) {
  return apiRequest<SolicitacaoFaxina>(`/solicitacoes/${solicitacaoId}`, {
    method: 'GET',
    token,
  });
}

export function cancelarSolicitacao(token: string, solicitacaoId: number) {
  return apiRequest<SolicitacaoFaxina>(`/solicitacoes/${solicitacaoId}/cancelar`, {
    method: 'PATCH',
    token,
  });
}

export function listarRegioesAtivas() {
  return apiRequest<RegiaoAtendimento[]>('/regioes', {
    method: 'GET',
  });
}
