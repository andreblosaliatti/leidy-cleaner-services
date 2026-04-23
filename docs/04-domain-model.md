# Modelo de Domínio

## 1. Entidades centrais

## 1.1 Usuario
Conta base de qualquer perfil.

### Campos principais
- id
- nomeCompleto
- email
- telefone
- senhaHash
- tipoUsuario
- statusConta
- emailVerificado
- telefoneVerificado
- ultimoLoginEm
- criadoEm
- atualizadoEm

---

## 1.2 PerfilCliente
Complemento do usuário do tipo cliente.

### Campos principais
- id
- usuarioId
- observacoesInternas
- criadoEm
- atualizadoEm

---

## 1.3 PerfilProfissional
Complemento do usuário do tipo profissional.

### Campos principais
- id
- usuarioId
- nomeExibicao
- cpf
- dataNascimento
- descricao
- fotoPerfilUrl
- experienciaAnos
- ativoParaReceberChamados
- statusAprovacao
- notaMedia
- totalAvaliacoes
- criadoEm
- atualizadoEm

---

## 1.4 Endereco
Endereço do usuário, especialmente do cliente.

### Campos principais
- id
- usuarioId
- cep
- logradouro
- numero
- complemento
- bairro
- cidade
- estado
- latitude
- longitude
- principal
- criadoEm

---

## 1.5 RegiaoAtendimento
Região ou bairro onde a profissional atua.

### Campos principais
- id
- nome
- tipo
- ativo

---

## 1.6 ProfissionalRegiao
Relação entre profissional e regiões atendidas.

### Campos principais
- id
- profissionalId
- regiaoId

---

## 1.7 DisponibilidadeProfissional
Disponibilidade semanal da profissional.

### Campos principais
- id
- profissionalId
- diaSemana
- horaInicio
- horaFim
- ativo

---

## 1.8 DocumentoVerificacao
Agrupa documentos e status de verificação.

### Campos principais
- id
- usuarioId
- tipoDocumento
- numeroDocumento
- documentoFrenteUrl
- documentoVersoUrl
- selfieUrl
- comprovanteResidenciaUrl
- statusVerificacao
- observacaoAnalise
- analisadoPorUsuarioId
- analisadoEm
- criadoEm

---

## 1.9 SolicitacaoFaxina
Pedido criado pelo cliente.

### Campos principais
- id
- clienteId
- enderecoId
- regiaoId
- dataHoraDesejada
- duracaoEstimadaHoras
- tipoServico
- observacoes
- valorServico
- percentualComissaoAgencia
- valorEstimadoProfissional
- status
- criadoEm
- atualizadoEm

### TipoServico
- FAXINA_RESIDENCIAL
- FAXINA_COMERCIAL
- FAXINA_CONDOMINIO
- FAXINA_EVENTO

---

## 1.10 SolicitacaoProfissionalSelecionado
Profissionais escolhidas pelo cliente para a solicitação.

### Campos principais
- id
- solicitacaoId
- profissionalId
- ordemEscolha
- criadoEm

---

## 1.11 ConviteProfissional
Convite operacional enviado às profissionais selecionadas.

### Campos principais
- id
- solicitacaoId
- profissionalId
- status
- enviadoEm
- visualizadoEm
- respondidoEm
- expiraEm

---

## 1.12 AtendimentoFaxina
Atendimento efetivo criado após aceite válido.

### Campos principais
- id
- solicitacaoId
- clienteId
- profissionalId
- status
- valorServico
- percentualComissaoAgencia
- valorEstimadoProfissional
- inicioPrevistoEm
- inicioRealEm
- fimRealEm
- criadoEm
- atualizadoEm

---

## 1.13 Pagamento
Cobrança da cliente para a empresa.

### Campos principais
- id
- atendimentoId
- gateway
- gatewayPaymentId
- metodoPagamento
- status
- valorBruto
- valorTaxaGateway
- valorLiquidoRecebido
- recebidoEm
- payloadResumo
- webhookProcessado
- criadoEm
- atualizadoEm

---

## 1.14 CheckpointServico
Registro de início e fim do atendimento.

### Campos principais
- id
- atendimentoId
- tipo
- registradoPorUsuarioId
- latitude
- longitude
- fotoComprovacaoUrl
- observacao
- registradoEm

---

## 1.15 AvaliacaoProfissional
Avaliação feita pelo cliente sobre a profissional.

### Campos principais
- id
- atendimentoId
- clienteId
- profissionalId
- nota
- comentario
- criadoEm
- atualizadoEm

---

## 1.16 OcorrenciaAtendimento
Problemas operacionais ou reclamações.

### Campos principais
- id
- atendimentoId
- abertoPorUsuarioId
- tipo
- descricao
- status
- resolvidoEm
- resolvidoPorUsuarioId
- criadoEm

---

## 2. Relacionamentos principais

### Cliente
- 1:1 com PerfilCliente
- 1:N com SolicitacaoFaxina
- 1:N com AtendimentoFaxina
- 1:N com AvaliacaoProfissional

### Profissional
- 1:1 com PerfilProfissional
- N:N com RegiaoAtendimento
- 1:N com DisponibilidadeProfissional
- 1:N com ConviteProfissional
- 1:N com AtendimentoFaxina
- 1:N com AvaliacaoProfissional

### Atendimento
- 1:1 com Pagamento no MVP
- 1:N com CheckpointServico
- 1:N com OcorrenciaAtendimento
- 1:1 com AvaliacaoProfissional

---

## 3. Regras de negócio centrais

### 3.1 Elegibilidade da profissional
Para aparecer como elegível, a profissional precisa:
- estar ativa
- ter aprovação do perfil
- ter verificação aprovada
- atender a região
- estar marcada como apta para receber chamados
- ter disponibilidade compatível
- não ter conflito com outro atendimento

### 3.2 Máximo de 3 selecionadas
A solicitação pode ter no máximo 3 profissionais selecionadas.

### 3.3 Primeira que aceitar ganha
A aceitação precisa ser transacional.

### 3.4 Pagamento
O pagamento sempre nasce de um atendimento.
O caminho principal do MVP inicia um checkout Asaas vinculado ao atendimento.

### 3.5 Confirmação
Somente o webhook altera o pagamento para confirmado de forma definitiva.

### 3.6 Avaliação
- apenas o cliente avalia
- apenas a profissional é avaliada
- só após atendimento finalizado
- uma avaliação por atendimento
- nota de 1 a 5

---

## 4. Enums recomendados

### TipoUsuario
- CLIENTE
- PROFISSIONAL
- ADMIN

### StatusConta
- PENDENTE_VERIFICACAO
- ATIVO
- SUSPENSO
- REJEITADO
- INATIVO

### StatusAprovacaoProfissional
- PENDENTE
- EM_ANALISE
- APROVADO
- REJEITADO
- BLOQUEADO

### StatusVerificacao
- PENDENTE
- EM_ANALISE
- APROVADO
- REJEITADO

### TipoServico
- PADRAO
- PESADA
- POS_OBRA
- PASSAR_ROUPA
- OUTRO

### StatusSolicitacao
- CRIADA
- AGUARDANDO_SELECAO
- CONVITES_ENVIADOS
- AGUARDANDO_ACEITE
- ACEITA
- PAGA
- EM_EXECUCAO
- FINALIZADA
- CANCELADA
- EXPIRADA

### StatusConvite
- ENVIADO
- VISUALIZADO
- ACEITO
- RECUSADO
- EXPIRADO
- CANCELADO

### StatusAtendimento
- AGUARDANDO_PAGAMENTO
- CONFIRMADO
- EM_EXECUCAO
- FINALIZADO
- CANCELADO
- EM_ANALISE

### MetodoPagamento
- PIX
- CARTAO
- BOLETO

### StatusPagamento
- PENDENTE
- AGUARDANDO_CONFIRMACAO
- PAGO
- FALHOU
- CANCELADO
- ESTORNADO

### TipoCheckpoint
- INICIO
- FIM

### TipoOcorrencia
- ATRASO
- AUSENCIA
- CONDUTA
- QUALIDADE_SERVICO
- PAGAMENTO
- OUTRO

### StatusOcorrencia
- ABERTA
- EM_ANALISE
- RESOLVIDA
- CANCELADA
