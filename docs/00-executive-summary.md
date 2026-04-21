# Resumo Executivo

## O produto

Leidy Cleaner Services é uma plataforma web para intermediação de serviços de limpeza residencial.

Ela conecta:
- clientes que precisam contratar faxina
- profissionais de limpeza previamente verificadas
- equipe administrativa da empresa

## Problema que o produto resolve

Hoje, o serviço de faxina costuma depender de WhatsApp, indicação, disponibilidade mal controlada, pagamentos dispersos e baixa padronização operacional.

A plataforma resolve isso com:
- cadastro estruturado
- verificação documental
- regiões de atendimento
- seleção de profissionais elegíveis
- fluxo claro de convite e aceite
- cobrança centralizada
- rastreio de execução do serviço
- supervisão administrativa

## Decisões mais importantes

### 1. O sistema será monorepo
Porque o projeto tem um frontend, um backend e documentação fortemente acoplados, e não há ganho real em separar cedo demais.

### 2. O pagamento entrará integralmente na conta da empresa
A plataforma não fará split nem repasse automático.

### 3. O gateway inicial será Asaas
A integração será feita por API e webhook.

### 4. O pagamento será vinculado ao atendimento
Não haverá cobrança solta. Cada cobrança nasce de um atendimento criado após o aceite válido.

### 5. O webhook será a fonte de verdade
O frontend nunca confirmará pagamento por conta própria.

### 6. A avaliação será unilateral
Somente o cliente poderá avaliar a profissional após o atendimento finalizado.

## Decisão técnica final recomendada

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
- Spring Security
- Spring Data JPA
- Bean Validation
- Flyway

### Dados e infraestrutura
- PostgreSQL
- Docker Compose para ambiente local
- Armazenamento de arquivos com S3 compatível no futuro

## Riscos centrais do projeto

### 1. Oferta e demanda
Sem profissionais suficientes, o fluxo não fecha. Sem clientes suficientes, as profissionais abandonam.

### 2. Concorrência no aceite
O fluxo “primeira que aceitar ganha” precisa ser transacional no backend.

### 3. Pagamento inconsistente
Sem webhook bem tratado, o atendimento pode ficar com status errado.

### 4. Escopo inchado
Chat, repasse automatizado, ranking avançado e automações extras são riscos de atraso se entrarem cedo demais.

## Sequência correta de execução

1. Base do monorepo
2. Auth e usuários
3. Perfis e onboarding profissional
4. Regiões, disponibilidade e elegibilidade
5. Solicitação de faxina
6. Convites e aceite transacional
7. Atendimento
8. Pagamento com Asaas + webhook
9. Avaliação
10. Painel admin e ocorrências

## Regra de ouro

O centro do produto não é o cadastro.

O centro do produto é o fluxo:
**solicitação → convite → aceite → atendimento → pagamento → execução → avaliação**
