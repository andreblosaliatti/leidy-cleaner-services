# Roadmap e Backlog

## Convenções
- P0 = crítico
- P1 = importante
- P2 = melhoria / polimento

---

## Fase 0 — Fundação do monorepo

### P0
- criar monorepo
- estruturar `apps/frontend`, `apps/backend`, `docs`, `infra`
- configurar README raiz
- configurar `.gitignore`
- configurar `docker-compose.yml` com PostgreSQL
- criar `.env.example`

---

## Fase 1 — Backend e frontend base

### P0
- criar projeto Spring Boot
- configurar segurança base
- configurar Flyway
- configurar conexão PostgreSQL
- criar projeto React + TS + Vite
- configurar Tailwind
- configurar rotas base
- criar layouts iniciais

---

## Fase 2 — Usuários e autenticação

### P0
- modelar `usuarios`
- modelar `perfis_cliente`
- modelar `perfis_profissional`
- criar endpoint de cadastro de cliente
- criar endpoint de cadastro de profissional
- criar endpoint de login
- criar endpoint `auth/me`
- aplicar JWT básico
- criar middleware de autorização

---

## Fase 3 — Onboarding profissional

### P0
- modelar `documentos_verificacao`
- criar upload/registro de documentos
- criar consulta do status de verificação
- criar análise de verificação pelo admin

### P1
- modelar `regioes_atendimento`
- criar seed de bairros/regiões iniciais
- modelar `profissional_regioes`
- modelar `disponibilidades_profissional`
- criar endpoints de regiões da profissional
- criar endpoints de disponibilidade

---

## Fase 4 — Cliente e solicitação

### P0
- modelar `enderecos`
- criar CRUD de endereços
- modelar `solicitacoes_faxina`
- criar endpoint de criação de solicitação
- criar listagem de solicitações do cliente
- criar listagem de profissionais elegíveis
- criar endpoint para seleção de até 3 profissionais

---

## Fase 5 — Convites e aceite

### P0
- modelar `convites_profissional`
- criar disparo de convites
- criar listagem de convites da profissional
- criar aceite transacional
- criar recusa de convite
- cancelar os demais convites após aceite válido

### Observação crítica
Essa fase não pode ser tratada como detalhe.
É uma das duas partes mais sensíveis do sistema.

---

## Fase 6 — Atendimento

### P0
- modelar `atendimentos_faxina`
- criar atendimento automaticamente após aceite válido
- listar atendimentos do usuário autenticado
- detalhar atendimento
- criar checkpoint de início
- criar checkpoint de fim
- atualizar status do atendimento conforme execução

---

## Fase 7 — Pagamento com Asaas

### P0
- modelar `pagamentos`
- criar integração base com Asaas
- criar endpoint de criação da cobrança
- salvar identificador externo
- criar endpoint de consulta de pagamento
- criar endpoint de webhook do Asaas
- atualizar status do pagamento via webhook
- atualizar atendimento para `CONFIRMADO` via webhook
- implementar idempotência mínima do webhook

### Observação crítica
Essa é a outra parte mais sensível do sistema.
Sem isso bem feito, o produto fica operacionalmente quebrado.

---

## Fase 8 — Avaliação

### P1
- modelar `avaliacoes_profissional`
- criar endpoint de avaliação
- restringir para cliente do atendimento
- restringir para atendimento finalizado
- impedir avaliação duplicada
- atualizar `notaMedia` e `totalAvaliacoes`

---

## Fase 9 — Ocorrências e admin

### P1
- modelar `ocorrencias_atendimento`
- criar abertura de ocorrência
- criar listagem do usuário
- criar listagem admin
- alterar status de ocorrência
- dashboard admin inicial
- listagens de profissionais, solicitações, atendimentos e pagamentos

---

## Fase 10 — Frontend operacional

### P1
- home pública
- login
- cadastro cliente
- cadastro profissional
- dashboard cliente
- dashboard profissional
- dashboard admin
- telas de solicitação
- telas de convites
- tela de atendimento ativo
- tela de pagamento
- tela de histórico
- tela de avaliação

---

## Fase 11 — Polimento

### P2
- loading states
- empty states
- toasts
- confirmação visual de ações críticas
- responsividade melhorada
- refinamento visual da dashboard

---

## Ordem real de execução sugerida

1. Fundação do monorepo
2. Backend/frontend base
3. Auth e usuários
4. Onboarding profissional
5. Endereços e solicitação
6. Convites e aceite
7. Atendimento
8. Pagamento com webhook
9. Avaliação
10. Admin e ocorrências
11. Polimento

---

## Pontos de maior risco técnico

### 1. Aceite concorrente
Precisa ser transacional.

### 2. Webhook do gateway
Precisa ser idempotente e alterar o atendimento corretamente.

### 3. Elegibilidade
Não pode virar filtro frouxo.

### 4. Estados
Não pode haver transições arbitrárias.
