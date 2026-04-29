import { apiRequest } from '../../../services/apiClient';
import type { SolicitacaoFaxina, StatusSolicitacao, TipoServico } from '../../cliente/solicitacoes/types';

export type ListarSolicitacoesAdminParams = {
  status?: StatusSolicitacao;
  clienteId?: number;
  regiaoId?: number;
  tipoServico?: TipoServico;
};

export function listarSolicitacoesAdmin(token: string, params: ListarSolicitacoesAdminParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.status) {
    searchParams.set('status', params.status);
  }

  if (params.clienteId) {
    searchParams.set('clienteId', String(params.clienteId));
  }

  if (params.regiaoId) {
    searchParams.set('regiaoId', String(params.regiaoId));
  }

  if (params.tipoServico) {
    searchParams.set('tipoServico', params.tipoServico);
  }

  const queryString = searchParams.toString();

  return apiRequest<SolicitacaoFaxina[]>(`/solicitacoes${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',
    token,
  });
}

export function buscarSolicitacaoAdmin(token: string, solicitacaoId: number) {
  return apiRequest<SolicitacaoFaxina>(`/solicitacoes/${solicitacaoId}`, {
    method: 'GET',
    token,
  });
}
