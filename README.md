# Leidy Cleaner Services

Monorepo da plataforma operacional de intermediacao de servicos de limpeza **Leidy Cleaner Services**.

O escopo de servicos contempla as categorias `FAXINA_RESIDENCIAL`, `FAXINA_COMERCIAL`, `FAXINA_CONDOMINIO` e `FAXINA_EVENTO`.

O produto segue as decisoes do `AGENTS.md` e de `docs/spec.md`: frontend React, backend Spring Boot, PostgreSQL, pagamento via Asaas Checkout vinculado ao atendimento e confirmacao por webhook.

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

Esse endpoint cria um checkout Asaas sempre vinculado a um `AtendimentoFaxina` e persiste o `Pagamento` como `PENDENTE`. O frontend redireciona a cliente para `checkoutUrl`, mas o retorno do checkout nao confirma pagamento. A confirmacao definitiva continua sendo feita apenas pelo webhook:

```text
POST /api/v1/webhooks/asaas
```

Variaveis usadas pela integracao:

```text
ASAAS_BASE_URL
ASAAS_API_KEY
ASAAS_CHECKOUT_SUCCESS_URL
ASAAS_CHECKOUT_CANCEL_URL
ASAAS_CHECKOUT_EXPIRED_URL
```

`ASAAS_DEFAULT_CUSTOMER_ID` existe somente para o endpoint legado `POST /api/v1/pagamentos`, que cria cobranca direta e nao e o caminho principal do checkout.

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
- frontend React + Vite com inicio de checkout e telas de retorno
- Tailwind CSS configurado
- PostgreSQL local via Docker Compose
- ambiente local documentado
