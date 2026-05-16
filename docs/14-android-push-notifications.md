# Android push notifications — fase M9-A

Este guia cobre apenas a primeira fase segura de push Android para o app profissional.

Escopo desta fase:
- registrar token do dispositivo Android no backend oficial
- manter o backend como fonte de verdade
- preparar endpoint de teste com provider no-op
- navegar para convite ou atendimento quando o payload trouxer `conviteId` ou `atendimentoId`
- documentar a configuração manual do Firebase/FCM para uma fase posterior

Fora desta fase:
- push em iOS
- envio automático ao criar convite ou atendimento
- credenciais reais do Firebase
- publicação na Play Store
- qualquer regra de negócio no frontend

---

## Backend disponível nesta fase

Endpoints:
- `POST /api/v1/notificacoes/dispositivos`
- `DELETE /api/v1/notificacoes/dispositivos/{id}`
- `POST /api/v1/notificacoes/teste`

Tabela:
- `dispositivos_push`

Provider:
- existe uma abstração `PushNotificationProvider`
- a implementação atual é no-op quando Firebase/FCM ainda não está configurado
- respostas não expõem token completo nem segredos

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

## Segredos futuros

Esta fase não define variáveis de produção para Firebase.

Quando o provider real for implementado, será necessário definir uma estratégia segura para credenciais, por exemplo:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_SERVICE_ACCOUNT_JSON`
- ou `GOOGLE_APPLICATION_CREDENTIALS`

Esses nomes são sugestões para a próxima fase. Não há leitura dessas variáveis no código atual.

---

## Checklist manual posterior

- [ ] Rodar `npm install` em `apps/frontend`
- [ ] Rodar `node node_modules/@capacitor/cli/bin/capacitor sync android`
- [ ] Adicionar `google-services.json` localmente
- [ ] Abrir `apps/frontend/android` no Android Studio
- [ ] Rodar em aparelho Android real
- [ ] Logar como profissional
- [ ] Aceitar a permissão de notificações
- [ ] Confirmar `POST /api/v1/notificacoes/dispositivos`
- [ ] Confirmar que o token completo não aparece na UI nem em logs
- [ ] Testar `POST /api/v1/notificacoes/teste`
- [ ] Validar navegação ao tocar em notificação com `conviteId`
- [ ] Validar navegação ao tocar em notificação com `atendimentoId`
