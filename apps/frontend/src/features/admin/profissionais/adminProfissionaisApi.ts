import { apiRequest } from '../../../services/apiClient';
import type {
  AnalisarProfissionalRequest,
  ListarProfissionaisAdminParams,
  PerfilProfissionalAdmin,
  PerfilProfissionalAprovacao,
} from './types';

export function listarProfissionaisAdmin(token: string, params: ListarProfissionaisAdminParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.statusAprovacao) {
    searchParams.set('statusAprovacao', params.statusAprovacao);
  }

  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim());
  }

  const queryString = searchParams.toString();

  return apiRequest<PerfilProfissionalAdmin[]>(`/profissionais${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',
    token,
  });
}

export function analisarProfissionalAdmin(token: string, profissionalId: number, payload: AnalisarProfissionalRequest) {
  return apiRequest<PerfilProfissionalAprovacao>(`/profissionais/${profissionalId}/aprovacao`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  });
}
