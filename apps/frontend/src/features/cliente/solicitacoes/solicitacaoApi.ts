import { apiRequest } from '../../../services/apiClient';
import type {
  RegiaoAtendimento,
  SolicitacaoFaxina,
  SolicitacaoFaxinaRequest,
  SolicitacaoPrecoPreview,
  SolicitacaoPrecoPreviewRequest,
} from './types';

export function criarSolicitacao(token: string, payload: SolicitacaoFaxinaRequest) {
  return apiRequest<SolicitacaoFaxina>('/solicitacoes', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export function previewPrecoSolicitacao(token: string, payload: SolicitacaoPrecoPreviewRequest) {
  return apiRequest<SolicitacaoPrecoPreview>('/solicitacoes/preview-preco', {
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
