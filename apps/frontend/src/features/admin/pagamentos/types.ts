export const statusPagamentoValues = ['PENDENTE', 'AGUARDANDO_CONFIRMACAO', 'PAGO', 'FALHOU', 'CANCELADO', 'ESTORNADO'] as const;

export type StatusPagamento = (typeof statusPagamentoValues)[number];

export const metodoPagamentoValues = ['PIX', 'BOLETO', 'CARTAO_CREDITO'] as const;

export type MetodoPagamento = (typeof metodoPagamentoValues)[number];

export type GatewayPagamento = 'ASAAS';

export type PagamentoAdmin = {
  id: number;
  atendimentoId: number;
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
