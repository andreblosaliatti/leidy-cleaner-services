import { apiBaseUrl } from './env';

type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiFailure = {
  success: false;
  code: string;
  message: string;
  errors: string[];
};

export type CheckoutResponse = {
  atendimentoId: number;
  checkoutUrl: string;
  valor: number;
  descricao: string;
};

export type Pagamento = {
  id: number;
  atendimentoId: number;
  gateway: 'ASAAS';
  gatewayPaymentId: string;
  metodoPagamento: 'PIX' | 'BOLETO' | 'CARTAO_CREDITO';
  status: 'PENDENTE' | 'AGUARDANDO_CONFIRMACAO' | 'PAGO' | 'FALHOU' | 'CANCELADO' | 'ESTORNADO';
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

export async function criarCheckout(token: string, atendimentoId: number): Promise<CheckoutResponse> {
  return apiRequest<CheckoutResponse>('/pagamentos/checkout', {
    method: 'POST',
    token,
    body: { atendimentoId },
  });
}

export async function buscarPagamentoPorAtendimento(token: string, atendimentoId: number): Promise<Pagamento> {
  return apiRequest<Pagamento>(`/pagamentos/atendimento/${atendimentoId}`, {
    method: 'GET',
    token,
  });
}

async function apiRequest<T>(
  path: string,
  options: {
    method: 'GET' | 'POST';
    token: string;
    body?: unknown;
  },
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method,
    headers: {
      Authorization: `Bearer ${options.token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const payload = (await response.json()) as ApiSuccess<T> | ApiFailure;

  if (!response.ok || !payload.success) {
    const message = payload.success ? 'Falha inesperada na API' : payload.message;
    throw new Error(message);
  }

  return payload.data;
}
