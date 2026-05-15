import { apiRequest } from '../../../services/apiClient';
import type { StatusCreditoSolicitacao } from '../../cliente/creditos/types';
import type { TipoServico } from '../../cliente/solicitacoes/types';
import type { AdminCreditoSolicitacaoDetalhe, AdminCreditoSolicitacaoListItem } from './types';

export type ListarCreditosSolicitacaoAdminParams = {
  status?: StatusCreditoSolicitacao;
  clienteId?: number;
  solicitacaoOrigemId?: number;
  solicitacaoUsoId?: number;
  pagamentoOrigemId?: number;
  tipoServico?: TipoServico;
  regiaoId?: number;
  criadoDe?: string;
  criadoAte?: string;
};

export function listarCreditosSolicitacaoAdmin(token: string, params: ListarCreditosSolicitacaoAdminParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.status) {
    searchParams.set('status', params.status);
  }
  if (params.clienteId) {
    searchParams.set('clienteId', String(params.clienteId));
  }
  if (params.solicitacaoOrigemId) {
    searchParams.set('solicitacaoOrigemId', String(params.solicitacaoOrigemId));
  }
  if (params.solicitacaoUsoId) {
    searchParams.set('solicitacaoUsoId', String(params.solicitacaoUsoId));
  }
  if (params.pagamentoOrigemId) {
    searchParams.set('pagamentoOrigemId', String(params.pagamentoOrigemId));
  }
  if (params.tipoServico) {
    searchParams.set('tipoServico', params.tipoServico);
  }
  if (params.regiaoId) {
    searchParams.set('regiaoId', String(params.regiaoId));
  }
  if (params.criadoDe) {
    searchParams.set('criadoDe', params.criadoDe);
  }
  if (params.criadoAte) {
    searchParams.set('criadoAte', params.criadoAte);
  }

  const queryString = searchParams.toString();

  return apiRequest<AdminCreditoSolicitacaoListItem[]>(
    `/admin/creditos-solicitacao${queryString ? `?${queryString}` : ''}`,
    {
      method: 'GET',
      token,
    },
  );
}

export function buscarCreditoSolicitacaoAdmin(token: string, creditoId: number) {
  return apiRequest<AdminCreditoSolicitacaoDetalhe>(`/admin/creditos-solicitacao/${creditoId}`, {
    method: 'GET',
    token,
  });
}
