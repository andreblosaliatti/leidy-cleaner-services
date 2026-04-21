# Arquitetura Técnica Recomendada

## 1. Visão geral

A arquitetura recomendada é de **monorepo com frontend e backend separados por aplicação**, compartilhando documentação, convenções e fluxos, mas sem forçar compartilhamento artificial de código entre Java e TypeScript.

---

## 2. Estrutura de pastas

```text
leidy-cleaner-services/
├── AGENTS.md
├── README.md
├── docker-compose.yml
├── .env.example
├── apps/
│   ├── frontend/
│   └── backend/
├── docs/
└── infra/
```

### Estrutura recomendada do backend

```text
apps/backend/src/main/java/br/com/leidycleaner/
├── auth/
├── usuarios/
├── clientes/
├── profissionais/
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

### Estrutura recomendada do frontend

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
├── services/
├── lib/
├── types/
└── routes/
```

---

## 3. Stack técnica

## 3.1 Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form
- Zod

## 3.2 Backend
- Java 21
- Spring Boot 3.x
- Spring Web
- Spring Security
- Spring Data JPA
- Bean Validation
- Flyway

## 3.3 Dados e ambiente
- PostgreSQL
- Docker Compose para ambiente local
- Redis opcional no futuro para expiração de convite, cache ou coordenação
- Storage S3 compatível no futuro para documentos e imagens

---

## 4. Padrões de arquitetura

### 4.1 Backend em camadas
- Controller
- Service
- Repository
- DTO
- Entity
- Mapper

### 4.2 Regras
- Controller fino
- Regra de negócio em Service
- Repository sem orquestração de processo
- DTO para entrada e saída
- Entidade não exposta diretamente na API

### 4.3 Frontend
- lógica de servidor centralizada
- formulários desacoplados
- componentes reutilizáveis
- estado de servidor com React Query
- validação com Zod

---

## 5. Arquitetura de pagamento

## 5.1 Decisão
O sistema usará **Asaas** com cobrança vinculada ao atendimento.

## 5.2 Regra de ouro
O **webhook** do gateway será a fonte de verdade para confirmação de pagamento.

### Consequência
O frontend:
- cria a cobrança por meio do backend
- exibe QR Code / PIX / status
- consulta status quando necessário
- não confirma pagamento por conta própria

### Backend
O backend deve:
- criar a cobrança no gateway
- armazenar o identificador externo
- receber e validar webhooks
- processar atualizações de status com segurança e idempotência
- atualizar o atendimento apenas quando o pagamento for realmente confirmado

---

## 6. Fluxo técnico principal

1. Cliente cria solicitação
2. Cliente seleciona até 3 profissionais
3. Sistema envia convites
4. Uma profissional aceita
5. Backend cria o atendimento
6. Atendimento fica em `AGUARDANDO_PAGAMENTO`
7. Backend cria cobrança no Asaas
8. Cliente paga
9. Webhook chega ao backend
10. Backend atualiza `pagamento = PAGO`
11. Backend atualiza `atendimento = CONFIRMADO`
12. Profissional pode iniciar o serviço
13. Profissional finaliza o serviço
14. Cliente avalia a profissional

---

## 7. Segurança

### 7.1 Auth
- JWT para access token
- refresh token em etapa posterior se necessário

### 7.2 Autorização
- por papel
- por ownership
- por relação com o recurso

### 7.3 Dados sensíveis
Devem ser tratados como sensíveis:
- documentos
- selfie
- comprovante de residência
- eventuais fotos de checkpoint

### 7.4 Webhook
- validar origem/assinatura quando aplicável
- tratar eventos duplicados
- impedir transições de status incorretas

---

## 8. Persistência

### 8.1 Banco
Usar PostgreSQL com modelagem relacional.

### 8.2 Migrações
- Flyway obrigatório
- nunca editar migration já aplicada em ambiente compartilhado
- criar novas migrations para mudanças

### 8.3 Enums
No banco, preferir `VARCHAR` + enums Java.
Não usar enum nativo do PostgreSQL no início.

---

## 9. Observabilidade mínima

Para o MVP, recomenda-se:
- logs estruturados básicos
- logs de integração do Asaas
- logs de erro em aceite e pagamento
- rastreio de ações críticas em auditoria

---

## 10. Decisões que não devem ser quebradas

- monorepo
- pagamento vinculado ao atendimento
- webhook como fonte de verdade
- repasse fora da plataforma
- avaliação apenas do cliente para a profissional
- máximo de 3 profissionais selecionadas por solicitação
