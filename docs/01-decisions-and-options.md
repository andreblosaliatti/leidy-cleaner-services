# Decisões e Opções Avaliadas

## 1. Estrutura do repositório

### Opções avaliadas

#### Opção A — Repositórios separados
**Prós**
- deploys totalmente independentes
- isolamento mais forte entre frontend e backend

**Contras**
- maior atrito de versionamento
- mais trabalho de documentação
- mais chance de desalinhamento entre contratos e implementação
- não traz benefício real no estágio inicial

#### Opção B — Monorepo
**Prós**
- melhor visão do produto inteiro
- versionamento coordenado
- documentação centralizada
- melhor para uma equipe pequena
- menor atrito operacional no início

**Decisão final**
**Monorepo**

---

## 2. Arquitetura do backend

### Opções avaliadas

#### Opção A — Node/NestJS
Boa produtividade, mas pior alinhamento com o histórico técnico do projeto.

#### Opção B — Spring Boot
Mais forte para regras transacionais, segurança, camadas e crescimento organizado.

**Decisão final**
**Java 21 + Spring Boot 3.x**

---

## 3. Frontend

### Opções avaliadas

#### Opção A — Next.js
Boa para SSR e marketing, mas adiciona complexidade que não é central no MVP da aplicação operacional.

#### Opção B — React + Vite
Mais simples, rápido para dashboard/app, ótimo para SPA com rotas autenticadas.

**Decisão final**
**React + TypeScript + Vite**

---

## 4. Banco de dados

### Opções avaliadas

#### Opção A — MongoDB
Ruim para estados transacionais, integridade relacional e fluxo de aceite/pagamento.

#### Opção B — PostgreSQL
Melhor para integridade, relacionamentos, histórico e auditoria.

**Decisão final**
**PostgreSQL**

---

## 5. Migrações

### Opções avaliadas

#### Opção A — Hibernate ddl-auto como base
Rápido para protótipo, ruim para rastreabilidade séria.

#### Opção B — Flyway
Mais controlado, melhor para evolução segura do banco.

**Decisão final**
**Flyway**

---

## 6. Pagamento

### Opções avaliadas

#### Opção A — Stripe Checkout
Bom para cobrança rápida, mas o produto não é apenas checkout. O fluxo exige um backend que acompanhe o atendimento e a confirmação real do pagamento. A Stripe documenta o Checkout como página de pagamento pré-construída, enquanto o Connect é a solução de marketplace para mover dinheiro entre múltiplas partes. Como o repasse ficará fora da plataforma, Connect ficaria pesado demais para o MVP. citeturn518880search1turn518880search2turn518880search6

#### Opção B — Asaas por API + webhook
O Asaas oferece API de cobrança e webhooks para notificação de eventos em tempo real, além de meios de pagamento adequados ao contexto brasileiro, como Pix e cartão. citeturn518880search0turn518880search4

**Decisão final**
**Asaas + cobrança vinculada ao atendimento + webhook no backend**

---

## 7. Modelo financeiro

### Opções avaliadas

#### Opção A — Split automático
Mais complexo, desnecessário neste momento e conflita com a decisão operacional já tomada.

#### Opção B — Pagamento integral para a empresa
Mais simples para o MVP e mais coerente com a operação desejada.

**Decisão final**
**Pagamento integral para a empresa e repasse fora da plataforma**

---

## 8. Avaliações

### Opções avaliadas

#### Opção A — Sem avaliação
Simplifica bastante, mas perde um sinal importante de qualidade operacional.

#### Opção B — Avaliação bilateral
Mais complexa, adiciona atrito e reabre um sistema de reputação maior do que o necessário agora.

#### Opção C — Avaliação unilateral
Entrega valor sem inflar o escopo.

**Decisão final**
**Apenas o cliente avalia a profissional**

---

## 9. Checkout do frontend

### Opções avaliadas

#### Opção A — Frontend controlar pagamento
Errado para esse produto.

#### Opção B — Frontend apenas exibe a cobrança
Certo.

**Decisão final**
O frontend:
- cria a cobrança via backend
- mostra QR Code / linha digitável / status
- espera o backend confirmar via webhook

---

## 10. Conclusão de arquitetura

A combinação mais coerente para o MVP é:
- monorepo
- React + Vite no frontend
- Spring Boot no backend
- PostgreSQL + Flyway
- Asaas para cobrança
- webhook como fonte de verdade
- avaliação unilateral
- repasse fora da plataforma
