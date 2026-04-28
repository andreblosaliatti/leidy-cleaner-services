import { apiRequest } from '../../../services/apiClient';
import type { AnalisarDocumentoVerificacaoRequest, DocumentoVerificacaoAdmin } from './types';

export function listarVerificacoesAdmin(token: string) {
  return apiRequest<DocumentoVerificacaoAdmin[]>('/verificacoes', {
    method: 'GET',
    token,
  });
}

export function buscarVerificacaoAdmin(token: string, verificacaoId: number) {
  return apiRequest<DocumentoVerificacaoAdmin>(`/verificacoes/${verificacaoId}`, {
    method: 'GET',
    token,
  });
}

export function analisarVerificacaoAdmin(
  token: string,
  verificacaoId: number,
  payload: AnalisarDocumentoVerificacaoRequest,
) {
  return apiRequest<DocumentoVerificacaoAdmin>(`/verificacoes/${verificacaoId}/analisar`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  });
}
