# Frontend — Milestones completos com checklist

## Objetivo
Este documento organiza a construção de **todo o frontend** do projeto **Leidy Cleaner Services**, com checklist para marcar cada entrega concluída.

---

## Princípios
- [ ] manter o frontend separado do backend dentro do monorepo
- [ ] usar o backend como fonte de verdade para regras críticas
- [ ] não jogar lógica de negócio sensível no frontend
- [ ] priorizar fluxos reais do produto antes de polimento visual
- [ ] construir primeiro o que dá suporte ao fluxo operacional principal

Fluxo central do produto:
**solicitação → seleção → convites → aceite → atendimento → pagamento → execução → avaliação**

---

## Situação atual resumida
O projeto já possui base de frontend criada, mas ainda não tem o frontend operacional completo.

Checklist de contexto atual:
- [ ] frontend base/scaffold revisado
- [ ] estrutura atual auditada antes de novas telas
- [ ] dependências principais confirmadas
- [ ] build do frontend validado

---

# Milestones do frontend

## F0 — Fundação do frontend
### Objetivo
Deixar a base do frontend organizada para crescimento real, sem virar bagunça.

### Entregas
- [ ] revisar estrutura de pastas do `apps/frontend/src`
- [ ] definir layout público
- [ ] definir layout autenticado
- [ ] definir sistema básico de rotas
- [ ] padronizar consumo da API
- [ ] padronizar tratamento de autenticação JWT no frontend
- [ ] definir estrutura de `app/`
- [ ] definir estrutura de `components/`
- [ ] definir estrutura de `layouts/`
- [ ] definir estrutura de `pages/`
- [ ] definir estrutura de `features/`
- [ ] definir estrutura de `services/`
- [ ] definir estrutura de `routes/`
- [ ] definir estrutura de `types/`
- [ ] criar base de tema visual alinhada à identidade do projeto
- [ ] criar componente base de botão
- [ ] criar componente base de input
- [ ] criar componente base de select
- [ ] criar componente base de textarea
- [ ] criar componente base de card
- [ ] criar componente base de badge/status
- [ ] criar componente base de modal/drawer
- [ ] criar componente base de tabela/listagem
- [ ] criar componente base de loading skeleton/spinner
- [ ] criar componente base de empty state

### Critério de pronto
- [ ] frontend sobe limpo
- [ ] rotas base organizadas
- [ ] consumo da API centralizado
- [ ] autenticação pronta para integração real com login

---

## F1 — Home pública e páginas institucionais
### Objetivo
Transformar o mock visual em uma home pública real e criar a camada pública do produto.

### Entregas
- [ ] implementar home pública baseada no mock visual aprovado
- [ ] implementar header responsivo
- [ ] implementar hero principal
- [ ] implementar seções de benefícios/como funciona
- [ ] implementar CTA para cadastro/login
- [ ] implementar seção explicando o fluxo do serviço
- [ ] implementar footer
- [ ] implementar página de login visual
- [ ] implementar página de cadastro de cliente visual
- [ ] implementar página de cadastro de profissional visual
- [ ] implementar página 404 básica

### Critério de pronto
- [ ] layout responsivo desktop/mobile
- [ ] identidade visual coerente
- [ ] home utilizável como vitrine real do produto
- [ ] navegação pública funcionando

---

## F2 — Autenticação e sessão
### Objetivo
Conectar o frontend ao que já existe no backend para login e sessão do usuário.

### Entregas
- [ ] integrar formulário de login com `POST /api/v1/auth/login`
- [ ] persistir token JWT no frontend
- [ ] carregar contexto do usuário com `GET /api/v1/auth/me`
- [ ] proteger rotas autenticadas
- [ ] redirecionar por perfil
- [ ] implementar logout
- [ ] tratar sessão expirada/401
- [ ] exibir mensagens de erro de autenticação

### Critério de pronto
- [ ] usuário consegue logar
- [ ] frontend sabe quem está autenticado
- [ ] rotas privadas protegidas
- [ ] sessão inválida é tratada sem quebrar a aplicação

---

## F3 — Fluxo de cadastro real
### Objetivo
Ligar os formulários públicos ao backend de cadastro já existente.

### Entregas
- [ ] integrar tela de cadastro de cliente
- [ ] integrar tela de cadastro de profissional
- [ ] implementar validação visual de formulário
- [ ] exibir mensagens de erro vindas da API
- [ ] implementar redirecionamento pós-cadastro
- [ ] implementar feedback de sucesso

### Critério de pronto
- [ ] cliente consegue criar conta pelo frontend
- [ ] profissional consegue criar conta pelo frontend
- [ ] erros de duplicidade/validação aparecem corretamente

---

## F4 — Dashboard base por perfil
### Objetivo
Criar a estrutura inicial das áreas logadas, sem ainda implementar todos os fluxos internos.

### Entregas
- [ ] implementar layout autenticado
- [ ] implementar sidebar/topbar
- [ ] implementar menu por perfil
- [ ] implementar dashboard inicial de cliente
- [ ] implementar dashboard inicial de profissional
- [ ] implementar dashboard inicial de admin
- [ ] implementar componente de status do usuário/perfil
- [ ] criar placeholders funcionais para áreas ainda não finalizadas

### Critério de pronto
- [ ] cada perfil entra em sua área correta
- [ ] navegação interna existe
- [ ] estrutura suporta expansão dos módulos

---

## F5 — Área do cliente: endereços
### Objetivo
Entregar a primeira parte operacional da área do cliente.

### Entregas
- [ ] implementar tela de listagem de endereços
- [ ] implementar formulário de criação de endereço
- [ ] implementar edição de endereço
- [ ] implementar exclusão de endereço
- [ ] implementar marcação visual de endereço principal
- [ ] implementar tratamento de loading, erro e vazio
- [ ] integrar com `POST /api/v1/enderecos`
- [ ] integrar com `GET /api/v1/enderecos/meus`
- [ ] integrar com `PUT /api/v1/enderecos/{id}`
- [ ] integrar com `DELETE /api/v1/enderecos/{id}`

### Critério de pronto
- [ ] cliente gerencia os próprios endereços pelo frontend
- [ ] principal é exibido corretamente
- [ ] UX mínima coerente

---

## F6 — Área do profissional: onboarding
### Objetivo
Entregar o fluxo de configuração da profissional no frontend.

### Entregas
- [ ] implementar tela “meu perfil profissional”
- [ ] implementar edição do perfil profissional
- [ ] implementar seleção de regiões atendidas
- [ ] implementar gestão de disponibilidades
- [ ] implementar envio/cadastro de verificação documental
- [ ] implementar consulta do status da própria verificação
- [ ] exibir aprovação pendente/rejeitada/aprovada
- [ ] integrar com `GET /api/v1/profissionais/me`
- [ ] integrar com `PUT /api/v1/profissionais/me`
- [ ] integrar com `POST /api/v1/profissionais/me/regioes`
- [ ] integrar com `GET /api/v1/profissionais/me/regioes`
- [ ] integrar com `POST /api/v1/profissionais/me/disponibilidades`
- [ ] integrar com `GET /api/v1/profissionais/me/disponibilidades`
- [ ] integrar com `PUT /api/v1/profissionais/me/disponibilidades/{id}`
- [ ] integrar com `DELETE /api/v1/profissionais/me/disponibilidades/{id}`
- [ ] integrar com `POST /api/v1/verificacoes/documentos`
- [ ] integrar com `GET /api/v1/verificacoes/minha`
- [ ] integrar com `GET /api/v1/regioes`

### Critério de pronto
- [ ] profissional consegue completar seu onboarding pelo frontend
- [ ] status da configuração fica visível
- [ ] regiões/disponibilidades/documentos funcionam de ponta a ponta

---

## F7 — Área do cliente: solicitação de faxina
### Objetivo
Implementar o início do fluxo principal do produto no frontend.

### Entregas
- [ ] implementar formulário de criação de solicitação
- [ ] implementar escolha de endereço
- [ ] implementar escolha de tipo de serviço
- [ ] implementar data/hora desejada
- [ ] implementar duração estimada
- [ ] implementar observações
- [ ] implementar listagem das solicitações do cliente
- [ ] implementar tela de detalhe da solicitação
- [ ] implementar cancelamento da solicitação quando permitido
- [ ] integrar com `POST /api/v1/solicitacoes`
- [ ] integrar com `GET /api/v1/solicitacoes/minhas`
- [ ] integrar com `GET /api/v1/solicitacoes/{id}`
- [ ] integrar com `PATCH /api/v1/solicitacoes/{id}/cancelar`

### Critério de pronto
- [ ] cliente consegue criar e acompanhar sua solicitação
- [ ] estados e erros ficam claros na UI

---

## F8 — Área do cliente: profissionais elegíveis e seleção
### Objetivo
Entregar a seleção de profissionais a partir da solicitação.

### Entregas
- [ ] implementar tela com profissionais elegíveis
- [ ] implementar cards/lista de profissionais
- [ ] exibir experiência/nota/média
- [ ] implementar seleção ordenada de até 3 profissionais
- [ ] implementar feedback visual da ordem da escolha
- [ ] persistir seleção
- [ ] integrar com `GET /api/v1/solicitacoes/{id}/profissionais-disponiveis`
- [ ] integrar com `POST /api/v1/solicitacoes/{id}/selecionados`

### Critério de pronto
- [ ] cliente consegue escolher de 1 a 3 profissionais
- [ ] frontend respeita a UX do limite
- [ ] backend continua sendo a validação final

---

## F9 — Área da profissional: convites
### Objetivo
Entregar o módulo de convites da profissional.

### Entregas
- [ ] implementar listagem de convites recebidos
- [ ] implementar detalhe do convite
- [ ] implementar ação de aceitar convite
- [ ] implementar ação de recusar convite
- [ ] implementar exibição de status do convite
- [ ] implementar indicação de prazo/expiração quando aplicável
- [ ] integrar com `GET /api/v1/convites/meus`
- [ ] integrar com `GET /api/v1/convites/{id}`
- [ ] integrar com `POST /api/v1/convites/{id}/aceitar`
- [ ] integrar com `POST /api/v1/convites/{id}/recusar`

### Critério de pronto
- [ ] profissional consegue visualizar e responder convites pelo frontend

---

## F10 — Área do cliente: pagamento
### Objetivo
Entregar a tela de pagamento alinhada ao backend e ao Asaas.

### Entregas
- [ ] implementar tela de checkout/pagamento vinculada ao atendimento
- [ ] exibir método de pagamento
- [ ] exibir QR Code / Pix copia-e-cola / link / status
- [ ] implementar polling ou refresh controlado de status quando necessário
- [ ] implementar visual de “aguardando confirmação”
- [ ] integrar com rota principal de checkout implementada no backend
- [ ] integrar com `GET /api/v1/pagamentos/{id}`
- [ ] integrar com `GET /api/v1/pagamentos/atendimento/{atendimentoId}`
- [ ] integrar com `POST /api/v1/pagamentos/{id}/consultar-status`

### Critério de pronto
- [ ] cliente consegue visualizar e acompanhar o pagamento
- [ ] frontend não confirma pagamento por conta própria

---

## F11 — Área do cliente e profissional: atendimentos
### Objetivo
Entregar a experiência operacional de atendimento para ambos os lados.

### Entregas
- [ ] implementar listagem “meus atendimentos”
- [ ] implementar detalhe do atendimento
- [ ] implementar exibição de checkpoints
- [ ] implementar ação de iniciar atendimento (profissional)
- [ ] implementar ação de finalizar atendimento (profissional)
- [ ] implementar visualização do atendimento pelo cliente
- [ ] integrar com `GET /api/v1/atendimentos/meus`
- [ ] integrar com `GET /api/v1/atendimentos/{id}`
- [ ] integrar com `GET /api/v1/atendimentos/{id}/checkpoints`
- [ ] integrar com `POST /api/v1/atendimentos/{id}/iniciar`
- [ ] integrar com `POST /api/v1/atendimentos/{id}/finalizar`

### Critério de pronto
- [ ] execução do serviço pode ser acompanhada no frontend
- [ ] profissional opera início/fim sem ambiguidade

---

## F12 — Área do cliente: avaliação
### Objetivo
Entregar o fechamento do fluxo principal com a avaliação da profissional.

### Entregas
- [ ] implementar formulário de avaliação pós-atendimento finalizado
- [ ] implementar nota de 1 a 5
- [ ] implementar comentário opcional
- [ ] implementar listagem de avaliações da profissional quando necessário
- [ ] integrar com `POST /api/v1/avaliacoes`
- [ ] integrar com `GET /api/v1/profissionais/{id}/avaliacoes`

### Critério de pronto
- [ ] cliente consegue avaliar uma única vez após atendimento finalizado

---

## F13 — Área admin
### Objetivo
Entregar o básico do operacional administrativo no frontend.

### Entregas
- [ ] implementar listagem de verificações documentais
- [ ] implementar detalhe de verificação
- [ ] implementar análise de verificação
- [ ] implementar aprovação/rejeição de profissional
- [ ] implementar listagens operacionais mínimas conforme backend existente
- [ ] preparar futura área de ocorrências quando esse módulo estiver pronto
- [ ] integrar com endpoints admin disponíveis

### Critério de pronto
- [ ] admin consegue operar aprovações e verificações pelo frontend

---

## F14 — Polimento e UX
### Objetivo
Transformar o frontend de funcional em utilizável de verdade.

### Entregas
- [ ] implementar loading states consistentes
- [ ] implementar empty states
- [ ] implementar toasts/feedbacks
- [ ] implementar tratamento elegante de erro
- [ ] implementar estados de sucesso
- [ ] refinar responsividade
- [ ] revisar acessibilidade básica
- [ ] revisar textos e consistência visual
- [ ] revisar navegação e proteção de rotas

### Critério de pronto
- [ ] frontend fica coerente, navegável e menos cru

---

# Ordem recomendada de execução
- [ ] F0 — Fundação do frontend
- [ ] F1 — Home pública e páginas institucionais
- [ ] F2 — Autenticação e sessão
- [ ] F3 — Cadastro real
- [ ] F4 — Dashboard base por perfil
- [ ] F5 — Endereços do cliente
- [ ] F6 — Onboarding profissional
- [ ] F7 — Solicitação de faxina
- [ ] F8 — Profissionais elegíveis e seleção
- [ ] F9 — Convites
- [ ] F10 — Pagamento
- [ ] F11 — Atendimentos
- [ ] F12 — Avaliação
- [ ] F13 — Admin
- [ ] F14 — Polimento

---

# Observações importantes
- [ ] não construir primeiro telas bonitas de dashboard antes dos fluxos reais
- [ ] não jogar validação crítica no frontend
- [ ] frontend deve refletir o backend, não reinventar regra de negócio
- [ ] cada milestone deve terminar com build funcionando
- [ ] preferir avanço incremental com revisão visual constante

---

# Definição de pronto do frontend
- [ ] a home pública está alinhada ao mock
- [ ] login/cadastro estão conectados ao backend
- [ ] cliente consegue percorrer o fluxo principal do produto
- [ ] profissional consegue operar onboarding, convites e atendimento
- [ ] pagamento pode ser acompanhado pelo frontend sem violar a regra do webhook
- [ ] avaliação funciona ao final do serviço
- [ ] admin tem pelo menos o básico operacional
