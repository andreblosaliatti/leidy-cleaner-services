# Leidy Cleaner Services — Planning Pack

Este pacote consolida a versão revisada do planejamento do produto, arquitetura, domínio, backlog e instruções para agentes de código.

## Arquivos

- `00-executive-summary.md` — resumo executivo e decisões centrais
- `01-decisions-and-options.md` — opções avaliadas e decisões finais
- `02-prd.md` — PRD consolidado
- `03-architecture.md` — arquitetura técnica recomendada
- `04-domain-model.md` — modelo de domínio e regras principais
- `05-api-scope.md` — escopo da API REST e fluxos críticos
- `06-roadmap-and-backlog.md` — roadmap, milestones e backlog por fases
- `AGENTS.md` — instruções operacionais para Codex/agent coding

## Posição final recomendada

- Monorepo
- Frontend React + TypeScript + Vite
- Backend Java 21 + Spring Boot 3.x
- PostgreSQL + Flyway
- Pagamentos com Asaas
- Cobrança vinculada ao atendimento
- Webhook do gateway como fonte de verdade para confirmação de pagamento
- Repasse fora da plataforma
- Avaliação unilateral: apenas o cliente avalia a profissional

## Princípio de construção

O sistema deve ser tratado como uma plataforma operacional de intermediação de serviços, não como um site institucional com agendamento.
