import { apiRequest } from '../../services/apiClient';
import type { DispositivoPushResponse, RegistrarDispositivoPushRequest, TestePushResponse } from './types';

export function registrarDispositivoPush(
  authToken: string,
  request: RegistrarDispositivoPushRequest,
) {
  return apiRequest<DispositivoPushResponse>('/notificacoes/dispositivos', {
    method: 'POST',
    token: authToken,
    body: JSON.stringify(request),
  });
}

export function desativarDispositivoPush(authToken: string, dispositivoId: number) {
  return apiRequest<DispositivoPushResponse>(`/notificacoes/dispositivos/${dispositivoId}`, {
    method: 'DELETE',
    token: authToken,
  });
}

export function enviarPushTeste(authToken: string) {
  return apiRequest<TestePushResponse>('/notificacoes/teste', {
    method: 'POST',
    token: authToken,
  });
}
