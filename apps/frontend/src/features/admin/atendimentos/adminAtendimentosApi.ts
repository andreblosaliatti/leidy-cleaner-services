import { apiRequest } from '../../../services/apiClient';
import type { AtendimentoFaxina, CheckpointServico, StatusAtendimento } from '../../atendimentos/types';

export type ListarAtendimentosAdminParams = {
  status?: StatusAtendimento;
  clienteId?: number;
  profissionalId?: number;
};

export function listarAtendimentosAdmin(token: string, params: ListarAtendimentosAdminParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.status) {
    searchParams.set('status', params.status);
  }

  if (params.clienteId) {
    searchParams.set('clienteId', String(params.clienteId));
  }

  if (params.profissionalId) {
    searchParams.set('profissionalId', String(params.profissionalId));
  }

  const queryString = searchParams.toString();

  return apiRequest<AtendimentoFaxina[]>(`/atendimentos${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',
    token,
  });
}

export function buscarAtendimentoAdmin(token: string, atendimentoId: number) {
  return apiRequest<AtendimentoFaxina>(`/atendimentos/${atendimentoId}`, {
    method: 'GET',
    token,
  });
}

export function listarCheckpointsAtendimentoAdmin(token: string, atendimentoId: number) {
  return apiRequest<CheckpointServico[]>(`/atendimentos/${atendimentoId}/checkpoints`, {
    method: 'GET',
    token,
  });
}
