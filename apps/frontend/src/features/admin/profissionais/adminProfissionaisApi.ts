import { apiRequest } from '../../../services/apiClient';
import type { AnalisarProfissionalRequest, PerfilProfissionalAdmin } from './types';

export function listarProfissionaisAdmin(token: string) {
  return apiRequest<PerfilProfissionalAdmin[]>('/profissionais', {
    method: 'GET',
    token,
  });
}

export function analisarProfissionalAdmin(token: string, profissionalId: number, payload: AnalisarProfissionalRequest) {
  return apiRequest<PerfilProfissionalAdmin>(`/profissionais/${profissionalId}/aprovacao`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  });
}
