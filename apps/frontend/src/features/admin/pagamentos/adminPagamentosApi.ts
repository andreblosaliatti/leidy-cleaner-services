import { apiRequest } from '../../../services/apiClient';
import type { MetodoPagamento, PagamentoAdmin, StatusPagamento } from './types';

export type ListarPagamentosAdminParams = {
  status?: StatusPagamento;
  metodoPagamento?: MetodoPagamento;
  atendimentoId?: number;
};

export function listarPagamentosAdmin(token: string, params: ListarPagamentosAdminParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.status) {
    searchParams.set('status', params.status);
  }

  if (params.metodoPagamento) {
    searchParams.set('metodoPagamento', params.metodoPagamento);
  }

  if (params.atendimentoId) {
    searchParams.set('atendimentoId', String(params.atendimentoId));
  }

  const queryString = searchParams.toString();

  return apiRequest<PagamentoAdmin[]>(`/pagamentos${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',
    token,
  });
}

export function buscarPagamentoAdmin(token: string, pagamentoId: number) {
  return apiRequest<PagamentoAdmin>(`/pagamentos/${pagamentoId}`, {
    method: 'GET',
    token,
  });
}
