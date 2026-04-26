import { apiRequest } from '../../../services/apiClient';
import type {
  AtualizarPerfilProfissionalRequest,
  DefinirRegioesProfissionalRequest,
  DisponibilidadeProfissional,
  DisponibilidadeProfissionalRequest,
  DocumentoVerificacao,
  DocumentoVerificacaoRequest,
  PerfilProfissional,
  RegiaoAtendimento,
} from './types';

export function buscarMeuPerfilProfissional(token: string) {
  return apiRequest<PerfilProfissional>('/profissionais/me', {
    method: 'GET',
    token,
  });
}

export function atualizarMeuPerfilProfissional(token: string, payload: AtualizarPerfilProfissionalRequest) {
  return apiRequest<PerfilProfissional>('/profissionais/me', {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  });
}

export function listarRegioesAtivas() {
  return apiRequest<RegiaoAtendimento[]>('/regioes', {
    method: 'GET',
  });
}

export function listarMinhasRegioesProfissional(token: string) {
  return apiRequest<RegiaoAtendimento[]>('/profissionais/me/regioes', {
    method: 'GET',
    token,
  });
}

export function definirMinhasRegioesProfissional(token: string, payload: DefinirRegioesProfissionalRequest) {
  return apiRequest<RegiaoAtendimento[]>('/profissionais/me/regioes', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export function listarMinhasDisponibilidades(token: string) {
  return apiRequest<DisponibilidadeProfissional[]>('/profissionais/me/disponibilidades', {
    method: 'GET',
    token,
  });
}

export function criarDisponibilidade(token: string, payload: DisponibilidadeProfissionalRequest) {
  return apiRequest<DisponibilidadeProfissional>('/profissionais/me/disponibilidades', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export function atualizarDisponibilidade(token: string, disponibilidadeId: number, payload: DisponibilidadeProfissionalRequest) {
  return apiRequest<DisponibilidadeProfissional>(`/profissionais/me/disponibilidades/${disponibilidadeId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  });
}

export function excluirDisponibilidade(token: string, disponibilidadeId: number) {
  return apiRequest<void>(`/profissionais/me/disponibilidades/${disponibilidadeId}`, {
    method: 'DELETE',
    token,
  });
}

export function buscarMinhaVerificacao(token: string) {
  return apiRequest<DocumentoVerificacao>('/verificacoes/minha', {
    method: 'GET',
    token,
  });
}

export function registrarDocumentoVerificacao(token: string, payload: DocumentoVerificacaoRequest) {
  return apiRequest<DocumentoVerificacao>('/verificacoes/documentos', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}
