# Android push notifications — fase M9 completa

Este guia cobre a implementação completa de push Android para o app profissional com suporte a Firebase/FCM.

Escopo desta implementação:
- registrar token do dispositivo Android no backend oficial
- manter o backend como fonte de verdade
- enviar push automaticamente ao criar convite após pagamento confirmado
- enviar push ao invocar endpoint de teste
- navegar para convite ou atendimento quando o payload trouxer `conviteId` ou `atendimentoId`
- provider Firebase/FCM (quando configurado com credenciais)
- provider no-op (quando Firebase não está configurado)

Fora desta implementação:
- push em iOS
- credenciais Firebase na árvore de versionamento (devem ser externas)
- publicação na Play Store
- qualquer regra de negócio no frontend
- payout
- split payment
- chat
- professional-to-client rating

---

## Backend implementado

Endpoints:
- `POST /api/v1/notificacoes/dispositivos` — registrar dispositivo com token push
- `DELETE /api/v1/notificacoes/dispositivos/{id}` — desativar dispositivo
- `POST /api/v1/notificacoes/teste` — enviar push de teste para dispositivos ativos

Tabela:
- `dispositivos_push` — armazena tokens de dispositivos Android ativos

Providers:
- `FirebaseCloudMessagingProvider` — implementação real via Firebase Admin SDK
- `NoOpPushNotificationProvider` — fallback quando Firebase não está configurado

Comportamento:
- quando `firebase.enabled=true` e credenciais estão disponíveis, usa Firebase
- quando `firebase.enabled=false` ou credenciais não existem, usa no-op (seguro, apenas registra log)
- envio de push nunca bloqueia a criação de convites ou atendimentos
- se push falhar, o negócio continua normalmente
- respostas de API nunca expõem token completo, segredos ou detalhes internos
- logs seguem padrão de mascarar dados sensíveis

---

## Dependência frontend

O `package.json` do frontend declara:

```json
"@capacitor/push-notifications": "^8.0.0"
```

Como a instalação não foi executada nesta tarefa, a pessoa responsável pela validação local deve rodar depois, em `apps/frontend`:

```bash
npm install
```

Depois da instalação, sincronizar o Android:

```bash
node node_modules/@capacitor/cli/bin/capacitor sync android
```

---

## Arquivo Firebase Android

Quando o projeto Firebase existir:

1. Abrir o Firebase Console.
2. Criar ou selecionar o projeto da Leidy Cleaner.
3. Adicionar app Android com package:
   `br.com.leidycleaner.profissional`
4. Baixar o arquivo `google-services.json`.
5. Colocar manualmente em:
   `apps/frontend/android/app/google-services.json`
6. Não versionar esse arquivo.

O arquivo está protegido por `.gitignore`.

---

## Permissão Android

O Android Manifest declara:

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

No Android 13+, o app deve pedir permissão em tempo de execução. O serviço frontend faz essa solicitação apenas quando roda em ambiente Capacitor Android e com sessão de profissional autenticada.

---

## Payload esperado

Payloads futuros podem incluir:

```json
{
  "tipo": "CONVITE_RECEBIDO",
  "conviteId": "123"
}
```

ou:

```json
{
  "tipo": "ATENDIMENTO_CONFIRMADO",
  "atendimentoId": "456"
}
```

Ao tocar na notificação:
- `conviteId` navega para `/profissional/app/convites/{conviteId}`
- `atendimentoId` navega para `/profissional/app/atendimentos/{atendimentoId}`

A tela de destino sempre deve buscar os dados no backend. O payload não autoriza ação nenhuma por si só.

---

## Configuração backend para Firebase

O backend suporta Firebase/FCM via variáveis de ambiente:

```env
FIREBASE_ENABLED=true
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
FIREBASE_PROJECT_ID=seu-projeto-firebase-id
```

### Obter credenciais Firebase

1. Aceder ao [Firebase Console](https://console.firebase.google.com/)
2. Criar ou selecionar um projeto para a Leidy Cleaner
3. No projeto, ir a **Configurações do Projeto** > **Contas de serviço**
4. Clicar em **Gerar nova chave privada**
5. Guardar o arquivo JSON localmente (não versionar)
6. Copiar o `project_id` do JSON e usar em `FIREBASE_PROJECT_ID`

### Variáveis de ambiente no deploy

- **Desenvolvimento local**: colocar o JSON num diretório local, configurar `GOOGLE_APPLICATION_CREDENTIALS`
- **Docker/container**: passar o JSON como volume ou como base64 em variável de ambiente
- **Kubernetes/produção**: usar secrets gerenciados

**Nunca versionar**:
- `google-services.json` (Android)
- `service-account-key.json` (backend)
- qualquer arquivo `.jks` ou `.keystore`
- qualquer key privada

### Desabilitar Firebase para testes

Se `FIREBASE_ENABLED=false` (padrão), o backend usa o provider no-op:
- registra avisos em logs
- contas de profissionais funcionam normalmente
- endpoints de notificação respondem com status "não configurado"

---

## Integração push com fluxo de negócio

### Ao criar convite após pagamento

1. Cliente cria solicitação → seleciona profissional → paga
2. Backend confirma pagamento via webhook
3. Backend cria `ConviteProfissional`
4. Backend envia push para profissional (assíncrono, não bloqueia):
   - Título: "Novo convite de faxina"
   - Corpo: "Você recebeu um novo convite para responder."
   - Dados: `tipo=CONVITE_RECEBIDO`, `conviteId={id}`
5. Se push falhar, convite continua criado e válido

### Ao chamar endpoint de teste

1. Profissional autenticado chama `POST /api/v1/notificacoes/teste`
2. Backend busca todos os dispositivos Android ativos do profissional
3. Backend envia push para cada dispositivo:
   - Título: "Teste de notificacao"
   - Corpo: "As notificacoes do app profissional estao prontas para configuracao."
   - Dados: `tipo=TESTE_PUSH`
4. Resposta inclui: `providerConfigurado`, `totalDispositivos`, `enviados`, `mensagem`

---

## Segredos futuros

Esta implementação atual não detecta ou publica credenciais.

Credenciais não devem:
- ser versionar em `.git`
- ser enviadas em logs
- ser expostas em respostas de API
- ser salvas em arquivos commitados

---

## Checklist de validação manual

### Backend
- [ ] Configurar `FIREBASE_ENABLED=true`
- [ ] Obter service account JSON do Firebase Console
- [ ] Colocar JSON num diretório seguro (não versionar)
- [ ] Configurar `GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json`
- [ ] Configurar `FIREBASE_PROJECT_ID=seu-projeto`
- [ ] Rodar backend (deve inicializar Firebase sem erro)
- [ ] Verificar logs: não devem conter tokens ou chaves privadas

### Frontend
- [ ] Rodar `npm install` em `apps/frontend`
- [ ] Rodar `node node_modules/@capacitor/cli/bin/capacitor sync android`

### Firebase Console
- [ ] Criar projeto na Firebase Console (ou usar existente)
- [ ] Adicionar app Android com package: `br.com.leidycleaner.profissional`
- [ ] Baixar `google-services.json` do Firebase Console
- [ ] Colocar `google-services.json` em `apps/frontend/android/app/` (local, não versionar)

### App Android
- [ ] Abrir `apps/frontend/android` no Android Studio
- [ ] Conectar aparelho Android real via USB (mínimo Android 10, idealmente 13+)
- [ ] Rodar o app no aparelho
- [ ] Logar como profissional
- [ ] Aceitar permissão de notificações quando solicitado

### Registro de dispositivo
- [ ] Navegar para qualquer página no app
- [ ] Confirmar que API `POST /api/v1/notificacoes/dispositivos` foi chamada
- [ ] Confirmar que token foi registrado no backend
- [ ] Verificar que token completo **não aparece** na UI (deve estar mascarado: `fcm-to...-123`)

### Teste de push
- [ ] Fazer request a `POST /api/v1/notificacoes/teste` com token do profissional
- [ ] Confirmar que push chega no aparelho
- [ ] Tocar na notificação "Teste de notificacao"
- [ ] App deve estar em primeiro plano (verificar que payload foi recebido)

### Criação de convite com push
- [ ] Criar nova solicitação de faxina como cliente
- [ ] Selecionar profissional previamente registrado e validado
- [ ] Completar pagamento (webhook deve confirmar)
- [ ] Backend deve ter criado `ConviteProfissional`
- [ ] Profissional deve receber push "Novo convite de faxina"
- [ ] Tocar na notificação
- [ ] App deve navegar para `/profissional/app/convites/{conviteId}`
- [ ] Detalhes do convite devem carregar do backend

### Segurança
- [ ] Confirmar logs não contêm token completo (deve estar mascarado)
- [ ] Confirmar resposta de API não expõe `GOOGLE_APPLICATION_CREDENTIALS`
- [ ] Confirmar `google-services.json` não foi commitado
- [ ] Confirmar `service-account-key.json` não foi commitado
- [ ] Confirmar `.gitignore` protege credenciais
