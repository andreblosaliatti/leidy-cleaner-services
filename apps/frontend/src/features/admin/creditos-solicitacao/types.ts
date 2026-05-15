import type { StatusCreditoSolicitacao } from '../../cliente/creditos/types';
import type { StatusSolicitacao, TipoServico } from '../../cliente/solicitacoes/types';
import type { GatewayPagamento, MetodoPagamento, StatusPagamento } from '../pagamentos/types';

export type AdminCreditoSolicitacaoListItem = {
  id: number;
  status: StatusCreditoSolicitacao;
  clienteId: number;
  clienteNome: string | null;
  solicitacaoOrigemId: number | null;
  pagamentoOrigemId: number | null;
  solicitacaoUsoId: number | null;
  tipoServico: TipoServico;
  duracaoEstimadaHoras: number;
  regiaoId: number;
  regiaoNome: string | null;
  valorReferencia: number | null;
  criadoEm: string;
  reservadoEm: string | null;
  utilizadoEm: string | null;
  canceladoEm: string | null;
  observacao: string | null;
};

export type AdminCreditoSolicitacaoSolicitacaoResumo = {
  id: number;
  status: StatusSolicitacao;
  clienteId: number;
  clienteNome: string | null;
  dataHoraDesejada: string;
  tipoServico: TipoServico;
  duracaoEstimadaHoras: number;
  regiaoId: number;
  regiaoNome: string | null;
};

export type AdminCreditoSolicitacaoPagamentoResumo = {
  id: number;
  gateway: GatewayPagamento;
  metodoPagamento: MetodoPagamento;
  status: StatusPagamento;
  gatewayPaymentId: string;
  solicitacaoId: number | null;
  atendimentoId: number | null;
  valorBruto: number;
  valorLiquidoRecebido: number | null;
  recebidoEm: string | null;
  criadoEm: string;
};

export type AdminCreditoSolicitacaoDetalhe = AdminCreditoSolicitacaoListItem & {
  solicitacaoOrigem: AdminCreditoSolicitacaoSolicitacaoResumo | null;
  pagamentoOrigem: AdminCreditoSolicitacaoPagamentoResumo | null;
  solicitacaoUso: AdminCreditoSolicitacaoSolicitacaoResumo | null;
};
