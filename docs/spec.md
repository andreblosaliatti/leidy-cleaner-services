# SPEC — Leidy Cleaner Services

## 1. Objetivo deste documento

Este documento transforma o PRD em uma especificação prática de execução do MVP da **Leidy Cleaner Services**.

Ele serve para:
- orientar desenvolvimento
- alinhar arquitetura e escopo
- definir critérios de pronto
- acompanhar progresso por **milestones**

---

## 2. Resumo do produto

Leidy Cleaner Services é uma plataforma web para intermediação de serviços de limpeza.

As categorias de serviço suportadas são:
- `FAXINA_RESIDENCIAL`
- `FAXINA_COMERCIAL`
- `FAXINA_CONDOMINIO`
- `FAXINA_EVENTO`

Fluxo central:
1. cliente cria conta
2. profissional cria conta
3. profissional envia documentação e define regiões/disponibilidade
4. cliente cria solicitação
5. cliente seleciona até 3 profissionais
6. sistema envia convites
7. o primeiro aceite válido gera o atendimento
8. cliente paga pela plataforma
9. backend confirma pagamento via webhook do Asaas
10. profissional executa o serviço
11. cliente avalia a profissional

---

## 3. Decisões técnicas fechadas

### Arquitetura
- **Monorepo**
- Estrutura principal:
  - `apps/frontend`
  - `apps/backend`
  - `docs`
  - `infra`

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
- Spring Boot 3
- Spring Security
- Spring Data JPA
- Bean Validation
- Flyway

### Banco de dados
- PostgreSQL

### Pagamento
- Asaas
- cobrança vinculada ao `AtendimentoFaxina`
- webhook como **fonte de verdade** para confirmação de pagamento

### Fora do escopo do MVP
- repasse dentro da plataforma
- split de pagamento
- avaliação bilateral
- chat
- app mobile
- múltiplos profissionais por atendimento

---

## 4. Escopo funcional do MVP

### Incluído
- autenticação
- cadastro de cliente
- cadastro de profissional
- verificação documental
- regiões atendidas
- disponibilidade do profissional
- criação de solicitação
- seleção de até 3 profissionais
- convites e aceite
- criação de atendimento
- pagamento via Asaas
- webhook de pagamento
- checkpoints de início e fim
- avaliação do cliente para a profissional
- ocorrências operacionais
- dashboard/admin básico

### Excluído
- pagamento para profissional
- carteira/saldo
- notificações complexas por WhatsApp
- ranking avançado
- recorrência
- assinatura

---

## 5. Domínio principal

### Entidades centrais
- `Usuario`
- `PerfilCliente`
- `PerfilProfissional`
- `Endereco`
- `RegiaoAtendimento`
- `ProfissionalRegiao`
- `DisponibilidadeProfissional`
- `DocumentoVerificacao`
- `SolicitacaoFaxina`
- `SolicitacaoProfissionalSelecionado`
- `ConviteProfissional`
- `AtendimentoFaxina`
- `Pagamento`
- `CheckpointServico`
- `AvaliacaoProfissional`
- `OcorrenciaAtendimento`

---

## 6. Regras de negócio críticas

### 6.1 Seleção de profissionais
- cliente pode selecionar **no máximo 3 profissionais**
- validação obrigatória no backend

### 6.2 Elegibilidade de profissional
Um profissional só pode aparecer como elegível se:
- conta ativa
- perfil aprovado
- documentos aprovados
- região compatível
- disponibilidade compatível
- sem conflito com atendimento ativo

### 6.3 Aceite do convite
- o primeiro aceite válido ganha o serviço
- essa operação deve ser **transacional**
- ao aceitar:
  - cria atendimento
  - marca convite como aceito
  - cancela os demais

### 6.4 Pagamento
- pagamento sempre vinculado ao atendimento
- caminho principal: `POST /api/v1/pagamentos/checkout`
- `POST /api/v1/pagamentos` fica como legado/deprecado para cobranca direta
- frontend nunca confirma pagamento por conta própria
- webhook do Asaas atualiza `Pagamento`
- após webhook válido:
  - `Pagamento = PAGO`
  - `Atendimento = CONFIRMADO`

### 6.5 Execução do serviço
- apenas a profissional do atendimento pode marcar início/fim
- não pode finalizar sem iniciar
- não pode iniciar duas vezes
- não pode finalizar duas vezes

### 6.6 Avaliação
- somente o cliente avalia
- somente a profissional é avaliada
- apenas após atendimento finalizado
- uma avaliação por atendimento
- nota de 1 a 5

---

## 7. Estrutura do monorepo

```text
leidy-cleaner-services/
├── AGENTS.md
├── README.md
├── apps/
│   ├── frontend/
│   └── backend/
├── docs/
│   ├── prd.md
│   ├── spec.md
│   ├── domain-model.md
│   └── api-scope.md
├── infra/
│   ├── docker-compose.yml
│   └── env/
└── packages/
    └── shared/ (opcional)
```

### Observação
`packages/shared` só deve existir se realmente houver valor para compartilhar contratos, schemas, OpenAPI ou assets. Não criar isso por moda.

---

## 8. Organização do backend

```text
apps/backend/src/main/java/.../
├── auth/
├── usuarios/
├── clientes/
├── profissionais/
├── enderecos/
├── regioes/
├── verificacao/
├── solicitacoes/
├── convites/
├── atendimentos/
├── pagamentos/
├── avaliacoes/
├── ocorrencias/
├── notificacoes/
├── auditoria/
├── config/
└── core/
```

### Padrões obrigatórios
- controllers finos
- regras em services
- DTOs para entrada/saída
- entities não expostas diretamente
- migrations com Flyway
- enums Java + `VARCHAR` no banco

---

## 9. Organização do frontend

```text
apps/frontend/src/
├── app/
├── components/
├── layouts/
├── pages/
├── features/
│   ├── auth/
│   ├── cliente/
│   ├── profissional/
│   ├── admin/
│   ├── solicitacoes/
│   ├── atendimentos/
│   └── pagamentos/
├── hooks/
├── lib/
├── routes/
├── services/
├── types/
└── data/
```

### Padrões obrigatórios
- UI em português (pt-BR)
- React Query para estado de servidor
- React Hook Form + Zod para formulários
- layout responsivo
- lógica crítica fora dos componentes

---

## 10. Estados do sistema

### Solicitação
- `CRIADA`
- `AGUARDANDO_SELECAO`
- `CONVITES_ENVIADOS`
- `AGUARDANDO_ACEITE`
- `ACEITA`
- `PAGA`
- `EM_EXECUCAO`
- `FINALIZADA`
- `CANCELADA`
- `EXPIRADA`

### Convite
- `ENVIADO`
- `VISUALIZADO`
- `ACEITO`
- `RECUSADO`
- `EXPIRADO`
- `CANCELADO`

### Atendimento
- `AGUARDANDO_PAGAMENTO`
- `CONFIRMADO`
- `EM_EXECUCAO`
- `FINALIZADO`
- `CANCELADO`
- `EM_ANALISE`

### Pagamento
- `PENDENTE`
- `AGUARDANDO_CONFIRMACAO`
- `PAGO`
- `FALHOU`
- `CANCELADO`
- `ESTORNADO`

### Verificação
- `PENDENTE`
- `EM_ANALISE`
- `APROVADO`
- `REJEITADO`

---

## 11. Endpoints mínimos previstos

### Auth
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Usuários
- `POST /api/v1/usuarios/clientes`
- `POST /api/v1/usuarios/profissionais`

### Regiões / disponibilidade
- `GET /api/v1/regioes`
- `POST /api/v1/profissionais/me/regioes`
- `POST /api/v1/profissionais/me/disponibilidades`

### Solicitações
- `POST /api/v1/solicitacoes`
- `GET /api/v1/solicitacoes/minhas`
- `GET /api/v1/solicitacoes/{id}/profissionais-disponiveis`
- `POST /api/v1/solicitacoes/{id}/selecionados`

### Convites
- `GET /api/v1/convites/meus`
- `POST /api/v1/convites/{id}/aceitar`
- `POST /api/v1/convites/{id}/recusar`

### Atendimentos
- `GET /api/v1/atendimentos/meus`
- `GET /api/v1/atendimentos/{id}`
- `POST /api/v1/atendimentos/{id}/iniciar`
- `POST /api/v1/atendimentos/{id}/finalizar`

### Pagamentos
- `POST /api/v1/pagamentos/checkout`
- `POST /api/v1/pagamentos` (legado/deprecado para cobranca direta)
- `GET /api/v1/pagamentos/{id}`
- `GET /api/v1/pagamentos/atendimento/{atendimentoId}`
- `POST /api/v1/pagamentos/{id}/consultar-status`
- `POST /api/v1/webhooks/asaas`

### Avaliações
- `POST /api/v1/avaliacoes`
- `GET /api/v1/profissionais/{id}/avaliacoes`

---

## 12. Critérios de pronto por área

### Fundação
- monorepo criado
- frontend sobe localmente
- backend sobe localmente
- PostgreSQL sobe via Docker Compose
- README com instruções

### Dados base
- migrations iniciais funcionando
- entidades principais cadastradas
- autenticação básica funcional

### Onboarding profissional
- cadastro funcional
- regiões salvas
- disponibilidade salva
- verificação com estrutura pronta

### Solicitações e convites
- cliente cria solicitação
- lista de elegíveis disponível
- seleção de até 3 implementada
- convites disparados
- aceite transacional implementado

### Pagamentos
- cobrança criada no Asaas
- `gateway_payment_id` persistido
- webhook processado com idempotência mínima
- atendimento confirmado só após webhook

### Atendimento
- início e fim funcionando
- checkpoints persistidos

### Avaliação
- cliente avalia profissional
- uma avaliação por atendimento
- média do profissional atualizada

---

## 13. Riscos principais

### Risco 1 — Aceite concorrente
Se o aceite não for transacional, duas profissionais podem ficar com o mesmo atendimento.

### Risco 2 — Webhook mal tratado
Se o webhook falhar ou for processado de forma errada, pagamento e atendimento ficam inconsistentes.

### Risco 3 — Escopo inchado
Se tentar adicionar chat, repasse, app ou automações cedo demais, o MVP atrasa sem necessidade.

### Risco 4 — Oferta e demanda
Mesmo com sistema funcionando, o modelo quebra se não houver profissionais e clientes suficientes.

---

## 14. Milestones do projeto

Use esta seção como checklist viva de execução.

## M0 — Fundação
- [ ] Criar monorepo (`apps/frontend`, `apps/backend`, `docs`, `infra`)
- [ ] Configurar backend Spring Boot base
- [ ] Configurar frontend React + Vite base
- [ ] Configurar PostgreSQL com Docker Compose
- [ ] Criar README com instruções locais
- [ ] Criar `.env.example`

## M1 — Dados base e autenticação
- [ ] Criar migration inicial de `usuarios`
- [ ] Criar migration de `perfis_cliente`
- [ ] Criar migration de `perfis_profissional`
- [ ] Criar estrutura de roles/perfis
- [ ] Implementar registro de cliente
- [ ] Implementar registro de profissional
- [ ] Implementar login com JWT
- [ ] Implementar endpoint `auth/me`

## M2 — Regiões, endereços e onboarding profissional
- [ ] Criar migration de `enderecos`
- [ ] Criar migration de `regioes_atendimento`
- [ ] Criar migration de `profissional_regioes`
- [ ] Criar migration de `disponibilidades_profissional`
- [ ] Seed inicial de bairros/regiões
- [ ] Implementar CRUD básico de endereços
- [ ] Implementar seleção de regiões da profissional
- [ ] Implementar disponibilidade semanal
- [ ] Implementar estrutura de documentos/verificação

## M3 — Frontend base
- [ ] Criar layout público
- [ ] Criar layout autenticado
- [ ] Criar páginas de login
- [ ] Criar cadastro de cliente
- [ ] Criar cadastro de profissional
- [ ] Criar dashboard cliente placeholder
- [ ] Criar dashboard profissional placeholder
- [ ] Criar dashboard admin placeholder

## M4 — Solicitações
- [ ] Criar migration de `solicitacoes_faxina`
- [ ] Implementar criação de solicitação
- [ ] Implementar listagem das minhas solicitações
- [ ] Implementar listagem de profissionais elegíveis
- [ ] Implementar seleção de até 3 profissionais
- [ ] Validar limite máximo no backend

## M5 — Convites
- [ ] Criar migration de `convites_profissional`
- [ ] Implementar disparo de convites
- [ ] Implementar listagem de convites da profissional
- [ ] Implementar recusa de convite
- [ ] Implementar aceite de convite com transação
- [ ] Cancelar automaticamente convites concorrentes

## M6 — Atendimento
- [ ] Criar migration de `atendimentos_faxina`
- [ ] Criar atendimento ao aceitar convite
- [ ] Implementar detalhes do atendimento
- [ ] Implementar endpoint de início do serviço
- [ ] Implementar endpoint de finalização do serviço
- [ ] Criar migration de `checkpoints_servico`
- [ ] Persistir checkpoints de início e fim

## M7 — Pagamentos
- [x] Criar migration de `pagamentos`
- [x] Implementar integracao Asaas Checkout para iniciar pagamento
- [x] Persistir identificador externo do checkout/pagamento
- [x] Criar tela frontend de pagamento e retorno
- [x] Implementar webhook do Asaas em `POST /api/v1/webhooks/asaas`
- [x] Garantir idempotencia basica do webhook
- [x] Atualizar pagamento para `PAGO` via webhook
- [x] Atualizar atendimento para `CONFIRMADO` apenas via webhook

## M8 — Avaliações
- [ ] Criar migration de `avaliacoes_profissional`
- [ ] Implementar criação de avaliação
- [ ] Validar 1 avaliação por atendimento
- [ ] Validar avaliação só após finalização
- [ ] Atualizar `notaMedia` e `totalAvaliacoes`
- [ ] Exibir avaliações da profissional

## M9 — Ocorrências e admin
- [ ] Criar migration de `ocorrencias_atendimento`
- [ ] Implementar abertura de ocorrência
- [ ] Implementar listagem/admin de ocorrências
- [ ] Implementar dashboard admin básico
- [ ] Implementar listagem de profissionais pendentes
- [ ] Implementar fluxo de aprovação/rejeição

## M10 — Polimento
- [ ] Adicionar validações UX no frontend
- [ ] Adicionar estados de loading
- [ ] Adicionar empty states
- [ ] Adicionar feedbacks/toasts
- [ ] Revisar permissões por perfil
- [ ] Revisar status e transições
- [ ] Revisar segurança mínima dos endpoints
- [ ] Revisar documentação final

---

## 15. Ordem recomendada de execução

1. M0 — Fundação
2. M1 — Dados base e auth
3. M2 — Onboarding profissional
4. M3 — Frontend base
5. M4 — Solicitações
6. M5 — Convites
7. M6 — Atendimento
8. M7 — Pagamentos
9. M8 — Avaliações
10. M9 — Ocorrências/admin
11. M10 — Polimento

---

## 16. Definição de sucesso do MVP

O MVP será considerado funcional quando:
- cliente conseguir criar solicitação completa
- profissional conseguir receber e aceitar convite
- atendimento for criado corretamente
- pagamento for confirmado via webhook
- profissional conseguir marcar início e fim
- cliente conseguir avaliar a profissional
- admin conseguir operar aprovações e acompanhar o básico

---

## 17. Observação final

Os dois pontos mais críticos do projeto são:
1. **aceite transacional do convite**
2. **confirmação de pagamento via webhook**

Se esses dois blocos estiverem mal feitos, o produto quebra mesmo que o resto esteja bonito.
