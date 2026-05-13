import { apiRequest } from '../../../services/apiClient';
import type { CreditoSolicitacao, StatusCreditoSolicitacao, UsarCreditoSolicitacaoResponse } from './types';

export function listarMeusCreditosSolicitacao(token: string, status?: StatusCreditoSolicitacao) {
  const search = status ? `?status=${encodeURIComponent(status)}` : '';

  return apiRequest<CreditoSolicitacao[]>(`/creditos-solicitacao/meus${search}`, {
    method: 'GET',
    token,
  });
}

export function usarCreditoEmSolicitacao(token: string, creditoId: number, solicitacaoId: number) {
  return apiRequest<UsarCreditoSolicitacaoResponse>(`/creditos-solicitacao/${creditoId}/usar-em-solicitacao/${solicitacaoId}`, {
    method: 'POST',
    token,
  });
}
