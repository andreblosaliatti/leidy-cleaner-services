import { apiRequest } from '../../../services/apiClient';
import type { SolicitacaoFaxina } from '../solicitacoes/types';
import type { ProfissionalDisponivel, SelecaoProfissionais, SelecionarProfissionaisRequest } from './types';

export function buscarSolicitacaoParaSelecao(token: string, solicitacaoId: number) {
  return apiRequest<SolicitacaoFaxina>(`/solicitacoes/${solicitacaoId}`, {
    method: 'GET',
    token,
  });
}

export function listarProfissionaisDisponiveis(token: string, solicitacaoId: number) {
  return apiRequest<ProfissionalDisponivel[]>(`/solicitacoes/${solicitacaoId}/profissionais-disponiveis`, {
    method: 'GET',
    token,
  });
}

export function selecionarProfissionais(token: string, solicitacaoId: number, payload: SelecionarProfissionaisRequest) {
  return apiRequest<SelecaoProfissionais>(`/solicitacoes/${solicitacaoId}/selecionados`, {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}
