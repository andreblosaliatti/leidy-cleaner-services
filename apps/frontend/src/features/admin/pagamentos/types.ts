export const statusPagamentoValues = ['PENDENTE', 'AGUARDANDO_CONFIRMACAO', 'PAGO', 'FALHOU', 'CANCELADO', 'ESTORNADO'] as const;

export type StatusPagamento = (typeof statusPagamentoValues)[number];

export const metodoPagamentoValues = ['PIX', 'BOLETO', 'CARTAO_CREDITO', 'CREDITO_SOLICITACAO'] as const;

export type MetodoPagamento = (typeof metodoPagamentoValues)[number];

export type GatewayPagamento = 'ASAAS' | 'INTERNO';

export type PagamentoAdmin = {
  id: number;
  atendimentoId: number | null;
  solicitacaoId: number | null;
  gateway: GatewayPagamento;
  gatewayPaymentId: string;
  metodoPagamento: MetodoPagamento;
  status: StatusPagamento;
  valorBruto: number;
  valorTaxaGateway: number | null;
  valorLiquidoRecebido: number | null;
  recebidoEm: string | null;
  urlPagamento: string | null;
  pixCopiaECola: string | null;
  webhookProcessado: boolean;
  criadoEm: string;
  atualizadoEm: string;
};
