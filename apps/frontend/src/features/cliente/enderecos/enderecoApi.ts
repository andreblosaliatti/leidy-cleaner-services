import { apiRequest } from '../../../services/apiClient';
import type { Endereco, EnderecoRequest } from './types';

export function listarMeusEnderecos(token: string) {
  return apiRequest<Endereco[]>('/enderecos/meus', {
    method: 'GET',
    token,
  });
}

export function criarEndereco(token: string, payload: EnderecoRequest) {
  return apiRequest<Endereco>('/enderecos', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export function atualizarEndereco(token: string, enderecoId: number, payload: EnderecoRequest) {
  return apiRequest<Endereco>(`/enderecos/${enderecoId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  });
}

export function excluirEndereco(token: string, enderecoId: number) {
  return apiRequest<void>(`/enderecos/${enderecoId}`, {
    method: 'DELETE',
    token,
  });
}
