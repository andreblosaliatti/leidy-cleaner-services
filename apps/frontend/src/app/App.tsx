import { FormEvent, useMemo, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';

import { buscarPagamentoPorAtendimento, criarCheckout, Pagamento } from '../lib/api';
import { apiBaseUrl } from '../lib/env';

const TOKEN_KEY = 'leidy.checkout.token';
const ATENDIMENTO_KEY = 'leidy.checkout.atendimentoId';

type Retorno = 'sucesso' | 'cancelado' | 'expirado';

export function App() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Routes>
        <Route path="/" element={<CheckoutStartPage />} />
        <Route path="/pagamento/sucesso" element={<CheckoutReturnPage tipo="sucesso" />} />
        <Route path="/pagamento/cancelado" element={<CheckoutReturnPage tipo="cancelado" />} />
        <Route path="/pagamento/expirado" element={<CheckoutReturnPage tipo="expirado" />} />
      </Routes>
    </main>
  );
}

function CheckoutStartPage() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? '');
  const [atendimentoId, setAtendimentoId] = useState(() => localStorage.getItem(ATENDIMENTO_KEY) ?? '');
  const navigate = useNavigate();

  const checkoutMutation = useMutation({
    mutationFn: () => criarCheckout(token.trim(), Number(atendimentoId)),
    onSuccess: (checkout) => {
      localStorage.setItem(TOKEN_KEY, token.trim());
      localStorage.setItem(ATENDIMENTO_KEY, String(checkout.atendimentoId));
      window.location.assign(checkout.checkoutUrl);
    },
  });

  const consultaQuery = useQuery({
    queryKey: ['pagamento-atendimento', atendimentoId, token],
    queryFn: () => buscarPagamentoPorAtendimento(token.trim(), Number(atendimentoId)),
    enabled: false,
    retry: false,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    checkoutMutation.mutate();
  }

  function consultar() {
    localStorage.setItem(TOKEN_KEY, token.trim());
    localStorage.setItem(ATENDIMENTO_KEY, atendimentoId.trim());
    void consultaQuery.refetch();
  }

  const formularioInvalido = !token.trim() || !Number(atendimentoId);

  return (
    <section className="mx-auto grid min-h-screen w-full max-w-6xl content-center gap-8 px-5 py-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-5">
        <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">Pagamento do atendimento</p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
          Iniciar checkout Asaas
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-700">
          O checkout nasce de um AtendimentoFaxina e o retorno apenas consulta o backend. A confirmacao definitiva continua vindo do webhook.
        </p>
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">API configurada</p>
          <p className="mt-2 break-all font-mono text-sm text-slate-900">{apiBaseUrl}</p>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <form className="space-y-5" onSubmit={submit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">JWT da cliente</span>
            <textarea
              className="mt-2 min-h-28 w-full resize-y rounded-md border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              spellCheck={false}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Atendimento ID</span>
            <input
              className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-base outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              inputMode="numeric"
              min={1}
              type="number"
              value={atendimentoId}
              onChange={(event) => setAtendimentoId(event.target.value)}
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              className="h-11 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={formularioInvalido || checkoutMutation.isPending}
              type="submit"
            >
              {checkoutMutation.isPending ? 'Criando checkout...' : 'Iniciar checkout'}
            </button>
            <button
              className="h-11 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
              disabled={formularioInvalido || consultaQuery.isFetching}
              onClick={consultar}
              type="button"
            >
              {consultaQuery.isFetching ? 'Consultando...' : 'Consultar pagamento'}
            </button>
          </div>

          {checkoutMutation.error ? <Alert tone="danger" message={checkoutMutation.error.message} /> : null}
          {consultaQuery.error ? <Alert tone="danger" message={consultaQuery.error.message} /> : null}
          {consultaQuery.data ? <PagamentoStatus pagamento={consultaQuery.data} /> : null}
        </form>

        <div className="mt-5 border-t border-slate-200 pt-4">
          <button
            className="text-sm font-semibold text-emerald-800 hover:text-emerald-950"
            onClick={() => navigate('/pagamento/sucesso')}
            type="button"
          >
            Abrir tela de retorno salva
          </button>
        </div>
      </div>
    </section>
  );
}

function CheckoutReturnPage({ tipo }: { tipo: Retorno }) {
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const atendimentoId = query.get('atendimentoId') ?? localStorage.getItem(ATENDIMENTO_KEY) ?? '';
  const token = localStorage.getItem(TOKEN_KEY) ?? '';

  const pagamentoQuery = useQuery({
    queryKey: ['pagamento-retorno', atendimentoId, token],
    queryFn: () => buscarPagamentoPorAtendimento(token, Number(atendimentoId)),
    enabled: Boolean(token && Number(atendimentoId)),
    refetchInterval: (queryState) => {
      const pagamento = queryState.state.data;
      return pagamento && pagamento.status !== 'PAGO' ? 5000 : false;
    },
    retry: false,
  });

  const titulo = {
    sucesso: 'Retorno do checkout',
    cancelado: 'Checkout cancelado',
    expirado: 'Checkout expirado',
  }[tipo];

  const texto = {
    sucesso: 'O retorno do Asaas foi recebido no navegador. Agora o status vem do backend.',
    cancelado: 'A cliente saiu do checkout sem finalizar. O atendimento segue aguardando pagamento ate uma confirmacao real.',
    expirado: 'A sessao do checkout expirou. Um novo checkout pode ser iniciado para o atendimento.',
  }[tipo];

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-5 py-8">
      <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">Asaas Checkout</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight">{titulo}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">{texto}</p>

        <div className="mt-6">
          {!token || !Number(atendimentoId) ? (
            <Alert
              tone="warning"
              message="Informe o JWT e o Atendimento ID na tela inicial para reconsultar o status do pagamento."
            />
          ) : null}
          {pagamentoQuery.isFetching && !pagamentoQuery.data ? <Alert tone="neutral" message="Consultando pagamento..." /> : null}
          {pagamentoQuery.error ? <Alert tone="danger" message={pagamentoQuery.error.message} /> : null}
          {pagamentoQuery.data ? <PagamentoStatus pagamento={pagamentoQuery.data} /> : null}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            className="h-11 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!token || !Number(atendimentoId) || pagamentoQuery.isFetching}
            onClick={() => void pagamentoQuery.refetch()}
            type="button"
          >
            {pagamentoQuery.isFetching ? 'Consultando...' : 'Reconsultar backend'}
          </button>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
            to="/"
          >
            Voltar ao atendimento
          </Link>
        </div>
      </div>
    </section>
  );
}

function PagamentoStatus({ pagamento }: { pagamento: Pagamento }) {
  const confirmado = pagamento.status === 'PAGO' && pagamento.webhookProcessado;
  const tom = confirmado ? 'border-emerald-200 bg-emerald-50 text-emerald-950' : 'border-amber-200 bg-amber-50 text-amber-950';

  return (
    <div className={`rounded-md border p-4 ${tom}`}>
      <p className="text-sm font-semibold">
        {confirmado ? 'Pagamento confirmado por webhook' : 'Aguardando confirmacao do webhook'}
      </p>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium">Atendimento</dt>
          <dd>{pagamento.atendimentoId}</dd>
        </div>
        <div>
          <dt className="font-medium">Status</dt>
          <dd>{pagamento.status}</dd>
        </div>
        <div>
          <dt className="font-medium">Webhook processado</dt>
          <dd>{pagamento.webhookProcessado ? 'sim' : 'nao'}</dd>
        </div>
        <div>
          <dt className="font-medium">Valor bruto</dt>
          <dd>{formatarMoeda(pagamento.valorBruto)}</dd>
        </div>
      </dl>
    </div>
  );
}

function Alert({ tone, message }: { tone: 'danger' | 'neutral' | 'warning'; message: string }) {
  const classes = {
    danger: 'border-red-200 bg-red-50 text-red-950',
    neutral: 'border-slate-200 bg-slate-50 text-slate-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-950',
  }[tone];

  return <p className={`rounded-md border px-3 py-2 text-sm ${classes}`}>{message}</p>;
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}
