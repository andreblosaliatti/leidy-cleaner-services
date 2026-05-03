import { formatEnderecoResumo } from '../enderecos/enderecoLabels';
import type { SolicitacaoContexto, SolicitacaoFaxina } from './types';

export function normalizeBairro(value: string) {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function getSolicitacaoEnderecoLabel(solicitacao: SolicitacaoFaxina, contexto?: SolicitacaoContexto) {
  if (solicitacao.enderecoResumo) {
    return solicitacao.enderecoResumo;
  }

  if (contexto?.endereco) {
    return formatEnderecoResumo(contexto.endereco);
  }

  return `Endereço ID ${solicitacao.enderecoId}`;
}

export function getSolicitacaoRegiaoLabel(solicitacao: SolicitacaoFaxina, contexto?: SolicitacaoContexto) {
  return solicitacao.regiaoNome ?? contexto?.regiao?.nome ?? solicitacao.bairro ?? `Região ID ${solicitacao.regiaoId}`;
}

export function getSolicitacaoClienteLabel(solicitacao: SolicitacaoFaxina) {
  return solicitacao.clienteNome ?? `Cliente ID ${solicitacao.clienteId}`;
}
