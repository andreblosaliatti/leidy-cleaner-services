# Leidy Cleaner Services

Monorepo da plataforma operacional de intermediacao de servicos de limpeza **Leidy Cleaner Services**.

O escopo de servicos contempla as categorias `FAXINA_RESIDENCIAL`, `FAXINA_COMERCIAL`, `FAXINA_CONDOMINIO` e `FAXINA_EVENTO`.

O produto segue as decisoes do `AGENTS.md` e de `docs/spec.md`: frontend React, backend Spring Boot, PostgreSQL, pagamento via Asaas vinculado ao atendimento e confirmacao por webhook.

## Estrutura

```text
.
├── apps/
│   ├── backend/
│   └── frontend/
├── docs/
├── infra/
├── docker-compose.yml
└── .env.example
```

## Requisitos locais

- Java 21
- Node.js 20+
- npm 10+
- Docker e Docker Compose

## Configuracao inicial

Crie seu arquivo local de ambiente a partir do exemplo:

```bash
cp .env.example .env
```

## Banco de dados

Suba o PostgreSQL local:

```bash
docker compose up -d postgres
```

Confira o status:

```bash
docker compose ps
```

Para parar:

```bash
docker compose down
```

## Backend

Execute a API Spring Boot:

```bash
cd apps/backend
./mvnw spring-boot:run
```

Por padrao, a API sobe em:

```text
http://localhost:8080
```

O prefixo previsto para os endpoints de negocio e:

```text
/api/v1
```

## Frontend

Instale dependencias e suba o Vite:

```bash
cd apps/frontend
npm install
npm run dev
```

Por padrao, o frontend sobe em:

```text
http://localhost:5173
```

## Pagamento Asaas

O caminho principal de pagamento e:

```text
POST /api/v1/pagamentos/checkout
```

Esse endpoint mantem o nome por compatibilidade, mas cria uma cobranca padrao no Asaas via `POST /payments`, sempre vinculada a um `AtendimentoFaxina`. O backend persiste o `Pagamento` como `PENDENTE`, salva `payment.id` em `pagamentos.gateway_payment_id` e retorna `invoiceUrl` como `checkoutUrl`/`paymentUrl`. O retorno do Asaas nao confirma pagamento; a confirmacao definitiva continua sendo feita apenas pelo webhook:

```text
POST /api/v1/webhooks/asaas
```

Variaveis usadas pela integracao:

```text
ASAAS_BASE_URL
ASAAS_API_KEY
ASAAS_WEBHOOK_TOKEN
ASAAS_DEFAULT_CUSTOMER_ID
ASAAS_PAYMENT_BILLING_TYPE
ASAAS_PAYMENT_AUTO_REDIRECT
ASAAS_PAYMENT_CALLBACK_ENABLED
ASAAS_CHECKOUT_BILLING_TYPES
ASAAS_CHECKOUT_SUCCESS_URL
ASAAS_CHECKOUT_CANCEL_URL
ASAAS_CHECKOUT_EXPIRED_URL
```

`ASAAS_CHECKOUT_BILLING_TYPES` permanece como fallback de compatibilidade para ambientes locais antigos. Para o fluxo principal, configure `ASAAS_PAYMENT_BILLING_TYPE` com `CREDIT_CARD` ou `PIX`.

`ASAAS_PAYMENT_CALLBACK_ENABLED` controla se o backend envia `callback.successUrl` no `POST /payments`. Em desenvolvimento local, mantenha `ASAAS_PAYMENT_CALLBACK_ENABLED=false`; assim o backend nao envia `callback`, mesmo que exista uma `ASAAS_CHECKOUT_SUCCESS_URL` antiga no ambiente, evitando o bloqueio do Asaas Sandbox quando a conta ainda nao possui dominio cadastrado. Para usar callback em producao, configure `ASAAS_PAYMENT_CALLBACK_ENABLED=true` e uma `ASAAS_CHECKOUT_SUCCESS_URL` cujo dominio esteja cadastrado na conta Asaas. Esse callback serve apenas para retorno visual do cliente ao site; sem callback, o cliente pode nao voltar automaticamente. A confirmacao de pagamento continua vindo exclusivamente do webhook, e a cobranca ainda pode ser confirmada via webhook mesmo sem callback.

Para pagamentos criados pelo fluxo principal, eventos de cobranca como `PAYMENT_CONFIRMED` e `PAYMENT_RECEIVED` reconciliam pelo campo `payment.id`. A localizacao por `payment.checkoutSession`, `checkout.id` e `externalReference` continua suportada para compatibilidade com registros antigos.

Seguranca do webhook:

- o endpoint continua publico no JWT para receber chamadas do Asaas
- toda chamada deve enviar o header `asaas-access-token`
- o backend compara esse header com `ASAAS_WEBHOOK_TOKEN` antes de processar o payload
- chamadas sem token ou com token invalido retornam erro JSON 401
- o backend valida a estrutura do payload e trata entregas duplicadas com idempotencia
- eventos nao suportados sao ignorados com resposta 200 para evitar retry desnecessario do gateway
- a confirmacao definitiva continua restrita ao webhook

## Scripts uteis

Backend:

```bash
cd apps/backend
./mvnw test
```

Frontend:

```bash
cd apps/frontend
npm run build
```

## Estado atual

Este repositorio esta na fundacao tecnica do MVP:

- monorepo preservado
- backend Spring Boot com fluxos operacionais iniciais
- frontend React + Vite em fundacao tecnica, sem telas operacionais de checkout entregues neste marco
- Tailwind CSS configurado
- PostgreSQL local via Docker Compose
- ambiente local documentado
