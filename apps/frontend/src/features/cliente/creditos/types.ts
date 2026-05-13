import type { TipoServico } from '../solicitacoes/types';

export type StatusCreditoSolicitacao = 'DISPONIVEL' | 'RESERVADO' | 'UTILIZADO' | 'CANCELADO' | 'EXPIRADO';

export type CreditoSolicitacao = {
  id: number;
  status: StatusCreditoSolicitacao;
  tipoServico: TipoServico;
  duracaoEstimadaHoras: number;
  regiaoId: number;
  regiaoNome: string | null;
  solicitacaoOrigemId: number;
  solicitacaoUsoId: number | null;
  criadoEm: string;
  utilizadoEm: string | null;
  valorReferencia: number | null;
};

export type UsarCreditoSolicitacaoResponse = {
  creditoSolicitacaoId: number;
  creditoStatus: StatusCreditoSolicitacao;
  solicitacaoId: number;
  solicitacaoStatus: string;
  pagamentoId: number;
  pagamentoStatus: string;
  conviteId: number;
  conviteStatus: string;
};
