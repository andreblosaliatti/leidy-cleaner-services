import { apiRequest } from '../../../services/apiClient';
import type { ConviteProfissional, ConviteResposta } from './types';

export function listarMeusConvites(token: string) {
  return apiRequest<ConviteProfissional[]>('/convites/meus', {
    method: 'GET',
    token,
  });
}

export function buscarConvite(token: string, conviteId: number) {
  return apiRequest<ConviteProfissional>(`/convites/${conviteId}`, {
    method: 'GET',
    token,
  });
}

export function aceitarConvite(token: string, conviteId: number) {
  return apiRequest<ConviteResposta>(`/convites/${conviteId}/aceitar`, {
    method: 'POST',
    token,
  });
}

export function recusarConvite(token: string, conviteId: number) {
  return apiRequest<ConviteResposta>(`/convites/${conviteId}/recusar`, {
    method: 'POST',
    token,
  });
}
