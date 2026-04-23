# PRD — Leidy Cleaner Services

## 1. Visão do produto

Leidy Cleaner Services é uma plataforma web para intermediação de serviços de limpeza.

A plataforma terá três perfis principais:
- Cliente
- Profissional
- Administrador

O objetivo é permitir que clientes contratem profissionais verificadas de forma mais segura, organizada e operacionalmente controlada.

As categorias de serviço suportadas no MVP são:
- `FAXINA_RESIDENCIAL`
- `FAXINA_COMERCIAL`
- `FAXINA_CONDOMINIO`
- `FAXINA_EVENTO`

---

## 2. Objetivo de negócio

Construir um MVP que permita validar a operação da agência com:
- captação e ativação de profissionais
- contratação de serviços por clientes
- cobrança centralizada
- acompanhamento do serviço
- supervisão administrativa

---

## 3. Problemas que o produto resolve

### Para o cliente
- dificuldade em encontrar profissionais confiáveis
- baixa padronização no atendimento
- pouca visibilidade do status do serviço

### Para a empresa
- operação descentralizada
- controle fraco de cadastro e validação
- dificuldade de rastrear solicitações, pagamentos e execução

### Para a profissional
- falta de organização de chamados
- ausência de fluxo claro de aceite
- pouca previsibilidade de atendimento

---

## 4. Perfis de usuário

## 4.1 Cliente
Pode:
- criar conta
- cadastrar endereços
- solicitar faxina residencial, comercial, condominial ou para eventos
- visualizar profissionais elegíveis
- selecionar até 3 profissionais
- pagar pela plataforma
- acompanhar atendimento
- avaliar a profissional

## 4.2 Profissional
Pode:
- criar conta
- enviar documentos
- cadastrar regiões atendidas
- cadastrar disponibilidade
- receber convites
- aceitar ou recusar convites
- iniciar e finalizar serviços

## 4.3 Admin
Pode:
- aprovar profissionais
- revisar documentos
- visualizar clientes, profissionais, solicitações e atendimentos
- acompanhar pagamentos
- tratar ocorrências

---

## 5. Escopo do MVP

## 5.1 Incluído
- autenticação
- cadastro de cliente
- cadastro de profissional
- verificação documental
- regiões de atendimento
- disponibilidade da profissional
- criação de solicitação
- listagem de profissionais elegíveis
- seleção de até 3 profissionais
- envio de convites
- aceite do primeiro convite válido
- criação de atendimento
- pagamento com Asaas
- webhook de pagamento
- início e fim do serviço
- avaliação unilateral
- painel admin básico
- ocorrências operacionais

## 5.2 Fora do escopo
- split de pagamento
- payout na plataforma
- avaliação da profissional sobre o cliente
- chat interno
- múltiplas profissionais no mesmo atendimento
- ranking avançado
- app mobile
- automações avançadas de marketing

---

## 6. Fluxo principal do produto

## 6.1 Fluxo do cliente
1. Cria conta
2. Cadastra endereço
3. Cria solicitação de faxina
4. Vê profissionais elegíveis
5. Seleciona até 3
6. Aguarda aceite
7. Paga
8. Acompanha atendimento
9. Avalia a profissional após conclusão

## 6.2 Fluxo da profissional
1. Cria conta
2. Envia documentos e selfie
3. Informa regiões
4. Informa disponibilidade
5. Aguarda aprovação
6. Recebe convites
7. Aceita ou recusa
8. Executa o serviço
9. Marca início e fim

## 6.3 Fluxo financeiro
1. Atendimento é criado após aceite válido
2. Backend cria cobrança no Asaas vinculada ao atendimento
3. Cliente paga
4. Asaas envia webhook
5. Backend confirma pagamento
6. Atendimento muda para confirmado

---

## 7. Regras de negócio

### 7.1 Seleção de profissionais
- mínimo 1
- máximo 3
- todos precisam ser elegíveis

### 7.2 Elegibilidade da profissional
A profissional precisa estar:
- ativa
- aprovada
- com verificação aprovada
- com região compatível
- disponível no horário
- sem atendimento conflitante

### 7.3 Convites
- são enviados para as selecionadas
- a primeira que aceitar validamente fica com o serviço
- as demais perdem o convite
- essa lógica deve ser transacional no backend

### 7.4 Pagamento
- o pagamento é da cliente para a empresa
- o repasse à profissional não faz parte do sistema transacional
- o webhook é a fonte de verdade

### 7.5 Execução do serviço
- somente a profissional do atendimento pode iniciar/finalizar
- não pode finalizar sem iniciar
- não pode iniciar duas vezes
- não pode finalizar duas vezes

### 7.6 Avaliação
- apenas o cliente avalia
- apenas a profissional é avaliada
- somente após atendimento finalizado
- uma avaliação por atendimento
- nota de 1 a 5

---

## 8. Estados principais

## 8.1 Solicitação
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

## 8.2 Atendimento
- AGUARDANDO_PAGAMENTO
- CONFIRMADO
- EM_EXECUCAO
- FINALIZADO
- CANCELADO
- EM_ANALISE

## 8.3 Pagamento
- PENDENTE
- AGUARDANDO_CONFIRMACAO
- PAGO
- FALHOU
- CANCELADO
- ESTORNADO

---

## 9. Métricas de sucesso

- quantidade de profissionais aprovadas
- quantidade de solicitações criadas
- taxa de aceite
- tempo médio até aceite
- taxa de pagamento concluído
- taxa de atendimento finalizado
- média de avaliações por profissional

---

## 10. Riscos

- pouca oferta de profissionais
- baixa conversão de aceite
- atraso ou falha no webhook
- gargalo na revisão documental
- escopo crescer antes da validação operacional

---

## 11. Critérios de sucesso do MVP

O MVP será considerado funcional quando:
- o cadastro completo de cliente e profissional estiver operando
- a profissional puder ser aprovada e configurada
- o cliente puder criar uma solicitação real
- o fluxo de convite e aceite funcionar sem dupla aceitação
- o pagamento puder ser criado e confirmado por webhook
- a profissional puder iniciar/finalizar o atendimento
- o cliente puder avaliar a profissional
