# AGENTS.md

## Project overview

This repository contains the product code and planning docs for **Leidy Cleaner Services**, a web platform for intermediation of residential cleaning services.

This is not a generic booking site.
This is an operational platform with:
- client registration
- professional registration
- identity verification
- matching by region and availability
- invitation dispatch
- first-valid-acceptance workflow
- centralized payment intake
- service execution tracking
- unilateral client-to-professional ratings
- admin supervision

---

## Fixed product decisions

These decisions are already made and must not be changed unless explicitly requested.

- architecture is **monorepo**
- payment provider is **Asaas**
- payment is linked to **AtendimentoFaxina**
- webhook is the **source of truth** for payment confirmation
- money goes to the **company account**
- payout to the professional is **outside the platform**
- rating is **unilateral**: only the client rates the professional
- there is **no** professional-to-client rating
- there is **no** split payment
- there is **no** in-platform payout flow
- there is **no** chat system in the MVP
- a client may select **up to 3 professionals** per request

Do not silently reintroduce excluded features.

---

## Product scope for the MVP

### In scope
- authentication and authorization
- client registration
- professional registration
- verification documents and selfie flow
- address management
- Porto Alegre service regions
- weekly availability
- service request creation
- eligible professional listing
- selection of up to 3 professionals
- invitation creation and response
- first valid acceptance wins
- attendance creation
- payment creation and webhook confirmation
- start/end service checkpoints
- client-to-professional rating
- occurrences/issues
- admin operational screens and approvals

### Out of scope
- payout automation
- split payment
- professional-to-client rating
- chat
- mobile app
- advanced ranking system
- recurring subscription model
- multiple professionals on one attendance

---

## Recommended tech stack

### Repository structure
```text
/apps/frontend
/apps/backend
/docs
/infra
```

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form
- Zod

### Backend
- Java 21
- Spring Boot 3.x
- Spring Web
- Spring Security
- Spring Data JPA
- Bean Validation
- Flyway

### Data and infra
- PostgreSQL
- Docker Compose for local development
- Redis optional later
- S3-compatible storage optional later

---

## Architecture rules

### Monorepo rule
Keep the repository as a monorepo.
Do not break it into multiple repositories unless explicitly requested.

### Backend rule
Use a modular, layered backend.
Suggested modules:
- auth
- usuarios
- clientes
- profissionais
- regioes
- verificacao
- solicitacoes
- convites
- atendimentos
- pagamentos
- avaliacoes
- ocorrencias
- notificacoes
- auditoria
- config
- core

### Layering rule
- controllers must be thin
- business logic belongs in services
- repositories must not orchestrate workflows
- DTOs must be used for API input/output
- entities must not be exposed directly in API responses

### Frontend rule
- do not place critical business logic in the frontend
- centralize API access
- use typed contracts
- use React Query for server state
- use React Hook Form + Zod for forms

---

## Core domain model

Core concepts:
- Usuario
- PerfilCliente
- PerfilProfissional
- Endereco
- RegiaoAtendimento
- ProfissionalRegiao
- DisponibilidadeProfissional
- DocumentoVerificacao
- SolicitacaoFaxina
- SolicitacaoProfissionalSelecionado
- ConviteProfissional
- AtendimentoFaxina
- Pagamento
- CheckpointServico
- AvaliacaoProfissional
- OcorrenciaAtendimento

Use these names consistently.
Do not casually rename core business concepts.

---

## Non-negotiable business rules

### 1. Eligibility
A professional is only eligible if:
- the account is active
- the professional profile is approved
- verification/documents are approved
- the professional serves the requested region
- the professional is active for receiving calls
- the availability matches the requested time
- the professional has no conflicting active attendance

### 2. Maximum selected professionals
A client may select:
- minimum: 1 professional
- maximum: 3 professionals

This must be enforced in the backend.
Not just in the UI.

### 3. First valid acceptance wins
When a professional accepts an invitation:
- verify the invitation is still valid
- verify the request is still open
- create the attendance
- mark the accepted invitation properly
- cancel the remaining invitations
- update request status consistently

This must be transactional.
Do not rely on frontend timing.

### 4. Payment
Payment must always be linked to an attendance.
Do not create loose payment flows detached from the operational process.

### 5. Webhook truth
Only the backend, through webhook processing, can definitively confirm a payment.
The frontend must not mark a payment as confirmed by itself.

### 6. Service execution
Only the assigned professional may:
- start the service
- finish the service

Rules:
- cannot finish before start
- cannot start twice
- cannot finish twice

### 7. Rating
The rating system is unilateral.
Rules:
- only the client may rate
- only the professional may be rated
- only after the attendance is completed
- one rating per attendance
- score must be from 1 to 5

### 8. Payout
Payout happens outside the platform.
Do not implement payout workflows inside the MVP unless explicitly requested.

---

## Database guidance

- use PostgreSQL
- use Flyway migrations
- never edit old applied migrations in shared environments
- create new migrations for changes
- prefer `VARCHAR` + Java enums instead of PostgreSQL enum types for business statuses
- add indexes for foreign keys and frequent filters
- use timestamps consistently

Expected key tables:
- usuarios
- roles
- usuario_roles
- enderecos
- regioes_atendimento
- perfis_cliente
- perfis_profissional
- profissional_regioes
- disponibilidades_profissional
- documentos_verificacao
- solicitacoes_faxina
- solicitacao_profissionais_selecionados
- convites_profissional
- atendimentos_faxina
- pagamentos
- checkpoints_servico
- avaliacoes_profissional
- ocorrencias_atendimento
- notificacoes
- auditoria_eventos

---

## API conventions

- base path: `/api/v1`
- JSON request/response
- DTO-based contracts
- paginated list endpoints where needed

Suggested success shape:
```json
{
  "success": true,
  "data": {}
}
```

Suggested error shape:
```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Human-readable message",
  "errors": []
}
```

---

## Security rules

- JWT for authentication
- role and ownership checks
- never store raw passwords
- never expose password hashes
- treat verification documents, selfies, proof of address, and checkpoint evidence as sensitive
- validate payment webhook authenticity/origin when possible
- make webhook handling idempotent

---

## Testing expectations

For critical flows, tests are expected.

### Must-test flows
- professional eligibility filtering
- max 3 selected professionals rule
- invitation acceptance
- prevention of double acceptance
- webhook payment confirmation updating attendance state
- start/end checkpoint rules
- rating permissions and uniqueness

If critical logic is changed without tests, call that out explicitly.

---

## Working style expectations

### Before coding
Identify:
- affected module
- affected business rules
- affected statuses
- whether a migration is needed
- whether API contracts will change
- whether frontend and backend both need updates

### For complex tasks
Provide a short plan first.
Then implement.

### If something is inconsistent
Do not improvise silently.
Call the inconsistency out.
Examples:
- requests to move payment confirmation to frontend
- requests to add in-platform payout
- requests to reintroduce bilateral ratings
- requests to bypass transactional acceptance logic

Be direct.

---

## Definition of done

A task is only done when:
- the business rules remain correct
- the architecture stays coherent
- migrations are correct
- API contracts remain consistent
- authorization/security concerns are handled
- relevant tests exist or missing coverage is clearly stated
- naming remains aligned with the domain
- no dead placeholder code is left behind

---

## Priority order

Optimize in this order:
1. business correctness
2. security and authorization
3. data integrity
4. maintainability
5. operational clarity
6. implementation speed
7. visual polish

---

## Hard do-not rules

Do not:
- implement payout in-platform
- implement split payment
- add professional-to-client rating
- rely on frontend for payment confirmation
- skip concurrency concerns in invitation acceptance
- create undocumented status values
- dump all logic into controllers
- create unnecessary microservices
- add dependencies without reason

---

## Final instruction

This product must behave like an operational platform, not a demo.
Prefer robust flows over fake completeness.
Be critical when the requested change weakens correctness.
