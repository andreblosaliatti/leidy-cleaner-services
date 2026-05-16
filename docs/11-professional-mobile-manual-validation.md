# Validação manual — app profissional mobile

## Objetivo
Este roteiro organiza a validação manual do frontend mobile profissional implementado entre `M1` e `M6`, antes de qualquer empacotamento em `M7 — Capacitor Android`.

Use este documento como checklist operacional.

Importante:
- não marque itens como concluídos sem executar o passo real
- o backend continua sendo a fonte de verdade
- este roteiro não instala Capacitor e não inicia `M7`

---

## 1. Checklist de ambiente

### Infra local
- [ ] PostgreSQL em execução
- [ ] Backend em execução
- [ ] Frontend em execução

### Variáveis mínimas esperadas
Com base em `.env.example`:

Banco e app local:
- [ ] `POSTGRES_DB=leidy_cleaner`
- [ ] `POSTGRES_USER=leidy`
- [ ] `POSTGRES_PASSWORD=leidy_dev_password`
- [ ] `POSTGRES_PORT=5432`
- [ ] `BACKEND_PORT=8080`
- [ ] `FRONTEND_PORT=5173`
- [ ] `SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/leidy_cleaner`
- [ ] `SPRING_DATASOURCE_USERNAME=leidy`
- [ ] `SPRING_DATASOURCE_PASSWORD=leidy_dev_password`
- [ ] `JWT_SECRET` configurado
- [ ] `JWT_EXPIRATION_SECONDS` configurado
- [ ] `VITE_API_BASE_URL=http://localhost:8080/api/v1`

Asaas local/sandbox, se a validação envolver pagamento de apoio para gerar convite:
- [ ] `ASAAS_BASE_URL=https://api-sandbox.asaas.com/v3`
- [ ] `ASAAS_API_KEY` configurada quando necessário
- [ ] `ASAAS_WEBHOOK_TOKEN` configurado
- [ ] `ASAAS_PAYMENT_AUTO_REDIRECT=true`
- [ ] `ASAAS_PAYMENT_CALLBACK_ENABLED=false` para localhost, salvo teste específico
- [ ] `ASAAS_CHECKOUT_SUCCESS_URL=http://localhost:5173/pagamento/sucesso`
- [ ] `ASAAS_CHECKOUT_CANCEL_URL=http://localhost:5173/pagamento/cancelado`
- [ ] `ASAAS_CHECKOUT_EXPIRED_URL=http://localhost:5173/pagamento/expirado`

### Comandos úteis de subida
- [ ] `docker compose up -d postgres`
- [ ] backend iniciado em `http://localhost:8080`
- [ ] frontend iniciado em `http://localhost:5173`

### Usuários de teste
Admin seed conhecido:
- [ ] `admin@leidycleaner.local / Admin123!local`

Profissional de teste:
- [ ] usuário profissional existente e funcional
- [ ] se não existir, criar pela UI pública ou por fixture local

Cliente de teste:
- [ ] usuário cliente existente e funcional
- [ ] se não existir, criar pela UI pública ou por fixture local

Observação:
- o repositório documenta claramente o admin seed
- cliente/profissional de teste variam conforme a base local; use contas reaproveitáveis ou crie novas no ambiente de validação

---

## 2. Pré-requisitos de dados

Antes de rodar os cenários mobile, confirme:
- [ ] profissional aprovada
- [ ] profissional com documentos aprovados
- [ ] profissional com ao menos uma região atendida
- [ ] profissional com ao menos uma disponibilidade semanal ativa
- [ ] cliente com endereço cadastrado
- [ ] solicitação criada pelo cliente
- [ ] profissional selecionada na solicitação
- [ ] convite pendente para a profissional
- [ ] atendimento confirmado disponível para teste
- [ ] atendimento em execução disponível para teste
- [ ] atendimento finalizado disponível, quando o cenário exigir

### Como preparar os dados
Use o fluxo real sempre que possível:
- [ ] cliente cria solicitação
- [ ] cliente seleciona exatamente 1 profissional
- [ ] pagamento é confirmado no backend
- [ ] convite é criado para a profissional
- [ ] profissional aceita convite para gerar atendimento `CONFIRMADO`
- [ ] profissional inicia atendimento para gerar estado `EM_EXECUCAO`
- [ ] profissional finaliza atendimento para gerar estado `FINALIZADO`

Se o ambiente local precisar acelerar cenários:
- [ ] documentar no relatório final quais estados vieram de fluxo real
- [ ] documentar quais estados vieram de seed/fixture/admin/manual DB

---

## 3. M2 — validação de convites

### Lista de convites
- [ ] abrir `/profissional/app/convites`
- [ ] confirmar loading state
- [ ] confirmar empty state quando aplicável
- [ ] confirmar convites ativos e histórico separados visualmente

### Detalhe do convite
- [ ] abrir `/profissional/app/convites/:id`
- [ ] confirmar status visível
- [ ] confirmar tipo de serviço
- [ ] confirmar data/hora
- [ ] confirmar duração
- [ ] confirmar região/endereço resumido
- [ ] confirmar valor estimado
- [ ] confirmar prazo de expiração

### Aceite válido
- [ ] tocar em `Aceitar convite`
- [ ] confirmar botão bloqueado durante envio
- [ ] confirmar mensagem de sucesso
- [ ] confirmar atualização de lista e detalhe
- [ ] confirmar criação do atendimento correspondente

### Recusa válida
- [ ] tocar em `Recusar convite`
- [ ] confirmar botão bloqueado durante envio
- [ ] confirmar mensagem de sucesso
- [ ] confirmar atualização de lista e detalhe

### Convite expirado
- [ ] abrir convite expirado
- [ ] confirmar que não há ação disponível
- [ ] ou, se houver estado defasado, confirmar mensagem amigável após retorno do backend

### Convite já aceito por outra profissional
- [ ] simular concorrência real
- [ ] tentar aceitar convite indisponível
- [ ] confirmar mensagem amigável
- [ ] confirmar refetch do estado após erro

### Prevenção de toque duplo
- [ ] tocar repetidamente em aceitar
- [ ] confirmar uma única submissão efetiva
- [ ] tocar repetidamente em recusar
- [ ] confirmar uma única submissão efetiva

### Erro de permissão
- [ ] abrir convite sem ownership/perfil válido
- [ ] confirmar tratamento amigável de `403`

---

## 4. M3 — validação de atendimentos

### Lista de atendimentos
- [ ] abrir `/profissional/app/atendimentos`
- [ ] confirmar loading state
- [ ] confirmar empty state quando aplicável
- [ ] confirmar separação entre confirmados, em andamento e histórico

### Detalhe do atendimento
- [ ] abrir `/profissional/app/atendimentos/:id`
- [ ] confirmar status
- [ ] confirmar cliente
- [ ] confirmar endereço/região
- [ ] confirmar data/hora
- [ ] confirmar tipo de serviço
- [ ] confirmar valor estimado
- [ ] confirmar seção de checkpoints

### Iniciar atendimento confirmado
- [ ] abrir atendimento `CONFIRMADO`
- [ ] tocar em `Iniciar serviço`
- [ ] confirmar bloqueio contra duplo envio
- [ ] confirmar mensagem de sucesso
- [ ] confirmar mudança visual após refetch

### Confirmar checkpoint persistido
- [ ] abrir novamente o detalhe
- [ ] confirmar checkpoint de início presente
- [ ] confirmar horário persistido

### Finalizar atendimento em execução
- [ ] abrir atendimento `EM_EXECUCAO`
- [ ] tocar em `Finalizar serviço`
- [ ] confirmar bloqueio durante envio
- [ ] confirmar mensagem de sucesso
- [ ] confirmar mudança visual após refetch

### Confirmar checkpoint final persistido
- [ ] abrir novamente o detalhe
- [ ] confirmar checkpoint de fim presente
- [ ] confirmar horários consistentes

### Tentar iniciar duas vezes
- [ ] repetir ação de iniciar
- [ ] confirmar mensagem compatível com `ATENDIMENTO_JA_INICIADO`

### Tentar finalizar antes do início
- [ ] usar atendimento ainda não iniciado
- [ ] tentar finalizar
- [ ] confirmar mensagem compatível com `ATENDIMENTO_NAO_INICIADO`

### Tentar finalizar duas vezes
- [ ] repetir finalização
- [ ] confirmar mensagem compatível com `ATENDIMENTO_JA_FINALIZADO`

### Tentar agir sobre atendimento não confirmado
- [ ] abrir atendimento em status incompatível
- [ ] confirmar ausência de ação ou mensagem amigável

---

## 5. M4 — validação de perfil, regiões e disponibilidade

### Perfil
- [ ] abrir `/profissional/app/perfil`
- [ ] confirmar carregamento dos dados atuais
- [ ] editar apenas campos permitidos
- [ ] salvar
- [ ] confirmar mensagem de sucesso
- [ ] atualizar a página
- [ ] confirmar persistência visual após refetch

### Regiões
- [ ] abrir `/profissional/app/regioes`
- [ ] confirmar lista de regiões ativas
- [ ] alterar seleção
- [ ] salvar
- [ ] confirmar mensagem de sucesso
- [ ] atualizar a página
- [ ] confirmar persistência visual após refetch

### Disponibilidade
- [ ] abrir `/profissional/app/disponibilidade`
- [ ] confirmar listagem atual
- [ ] criar disponibilidade
- [ ] editar disponibilidade existente
- [ ] remover disponibilidade
- [ ] confirmar mensagens de sucesso e estados de loading
- [ ] atualizar a página
- [ ] confirmar persistência visual após refetch

### Observação importante
- [ ] registrar no relatório que matching/elegibilidade do backend precisa de validação separada

---

## 6. M5 — validação de verificação documental

### Status
- [ ] abrir `/profissional/app/verificacao`
- [ ] confirmar status atual visível
- [ ] confirmar motivo de rejeição quando houver

### Upload e reenvio
- [ ] enviar documentos válidos
- [ ] reenviar documentos quando aplicável
- [ ] confirmar mensagem de sucesso
- [ ] confirmar refetch do status

### Validação de imagem
- [ ] tentar arquivo de tipo inválido
- [ ] tentar arquivo acima do limite suportado
- [ ] confirmar mensagens de validação

### Segurança visual
- [ ] confirmar que URLs brutas de arquivos não aparecem na UI mobile

### Limitação atual
- [ ] registrar se houve necessidade de campo estruturado de `pendências`

---

## 7. M6 — validação de ocorrências

### Lista
- [ ] abrir `/profissional/app/ocorrencias`
- [ ] confirmar loading state
- [ ] confirmar empty state quando aplicável
- [ ] confirmar separação visual entre em andamento e encerradas

### Detalhe
- [ ] abrir `/profissional/app/ocorrencias/:id`
- [ ] confirmar status
- [ ] confirmar tipo
- [ ] confirmar descrição
- [ ] confirmar atendimento relacionado
- [ ] confirmar datas de criação/resolução

### Criar ocorrência vinculada a atendimento
- [ ] abrir `/profissional/app/ocorrencias/nova`
- [ ] selecionar atendimento
- [ ] selecionar tipo
- [ ] preencher descrição
- [ ] enviar
- [ ] confirmar bloqueio contra envio duplicado
- [ ] confirmar navegação ao detalhe criado

### Criar a partir do detalhe do atendimento
- [ ] abrir `/profissional/app/atendimentos/:id`
- [ ] tocar em `Abrir ocorrência deste atendimento`
- [ ] confirmar atendimento pré-selecionado

### Atendimento inválido
- [ ] tentar abrir com `atendimentoId` inválido/sem acesso
- [ ] confirmar mensagem amigável

### Confirmação em lista/detalhe
- [ ] confirmar que a ocorrência criada aparece na lista
- [ ] confirmar que o detalhe abre corretamente

### Admin web
- [ ] abrir fluxo admin web, se disponível no ambiente
- [ ] confirmar que a ocorrência aparece para admin

---

## 8. Regressões

### WhatsApp
- [ ] home pública continua exibindo o botão flutuante de WhatsApp
- [ ] área `/profissional/app` não exibe o botão flutuante

### Fluxos desktop/web
- [ ] fluxo web profissional continua abrindo normalmente
- [ ] fluxo web de convites continua funcionando
- [ ] fluxo web de atendimentos continua funcionando
- [ ] fluxo web de ocorrências continua funcionando

### Componentes compartilhados reutilizados
- [ ] `OcorrenciaForm` continua funcionando no web
- [ ] `DisponibilidadeList` continua funcionando no web e mobile
- [ ] componentes compartilhados não perderam estados de loading/disable

---

## 9. Checklist geral de pass/fail

### Ambiente
- [ ] PASS ambiente pronto
- [ ] FAIL ambiente bloqueado

### M2
- [ ] PASS convites
- [ ] FAIL convites

### M3
- [ ] PASS atendimentos
- [ ] FAIL atendimentos

### M4
- [ ] PASS perfil/regiões/disponibilidade
- [ ] FAIL perfil/regiões/disponibilidade

### M5
- [ ] PASS verificação
- [ ] FAIL verificação

### M6
- [ ] PASS ocorrências
- [ ] FAIL ocorrências

### Regressões
- [ ] PASS regressões principais
- [ ] FAIL regressões principais

---

## 10. Decisão final

### Ready for M7 Android packaging
- [ ] Sim
- [ ] Não

### Blockers
- [ ] Convite expirado não validado
- [ ] Aceite concorrente não validado
- [ ] Início/fim de atendimento não validados em fluxo real
- [ ] Persistência de checkpoints não validada em fluxo real
- [ ] Matching/elegibilidade após ajuste de regiões/disponibilidade não validado
- [ ] Fluxo real de verificação documental não validado
- [ ] Fluxo real de ocorrência não validado
- [ ] Outro bloqueador documentado abaixo

### Non-blocking risks
- [ ] DTO de verificação sem campo estruturado de `pendências`
- [ ] DTO de atendimento sem `observações`
- [ ] DTO de ocorrência com resumo enxuto do atendimento relacionado
- [ ] Aviso de chunk grande no build do frontend
- [ ] Outro risco não bloqueante documentado abaixo

### Observações finais
Anote aqui:

```text
- data da execução:
- ambiente usado:
- usuários usados:
- itens que falharam:
- evidências / prints / links:
- decisão final:
```
