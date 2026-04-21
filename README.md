# Leidy Cleaner Services

Monorepo da plataforma operacional de intermediacao de servicos de limpeza residencial **Leidy Cleaner Services**.

O produto segue as decisoes do `AGENTS.md` e de `docs/spec.md`: frontend React, backend Spring Boot, PostgreSQL, pagamento futuro via Asaas vinculado ao atendimento e confirmacao por webhook.

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
- Maven 3.9+
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
mvn spring-boot:run
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

## Scripts uteis

Backend:

```bash
cd apps/backend
mvn test
```

Frontend:

```bash
cd apps/frontend
npm run build
```

## Estado atual

Este repositorio esta na fundacao tecnica do MVP:

- monorepo preservado
- backend Spring Boot minimo para boot
- frontend React + Vite minimo
- Tailwind CSS configurado
- PostgreSQL local via Docker Compose
- ambiente local documentado

Ainda nao ha implementacao de entidades de negocio, autenticacao real, pagamentos, convites, solicitacoes ou fluxos operacionais. Esses itens pertencem aos proximos milestones.
