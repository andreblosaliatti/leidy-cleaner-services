# Android build e assinatura — guia manual

## Objetivo
Este documento prepara o passo manual de build Android para o app profissional sem versionar segredos.

Escopo:
- build debug local
- instalacao do APK debug
- preparacao manual de keystore release
- geracao manual de AAB release no Android Studio

Fora de escopo:
- iOS
- push notifications
- Play Store
- assinatura automatizada em CI
- commit de keystore ou senhas

## Estado atual do projeto Android
- projeto Android gerado em `apps/frontend/android`
- `applicationId`: `br.com.leidycleaner.profissional`
- `appName`: `Leidy Cleaner Profissional`
- `webDir`: `dist`

Arquivos de referencia:
- [apps/frontend/android/build.gradle](/home/andre/projects/leidy-cleaner-services/apps/frontend/android/build.gradle)
- [apps/frontend/android/app/build.gradle](/home/andre/projects/leidy-cleaner-services/apps/frontend/android/app/build.gradle)
- [apps/frontend/android/gradle.properties](/home/andre/projects/leidy-cleaner-services/apps/frontend/android/gradle.properties)
- [apps/frontend/capacitor.config.ts](/home/andre/projects/leidy-cleaner-services/apps/frontend/capacitor.config.ts)

## Debug build — situacao atual
O projeto esta pronto para gerar build debug local.

Motivos:
- o modulo `app` existe
- o projeto Gradle Android foi gerado
- o `buildTypes { release { ... } }` nao remove o build debug padrao
- o Android Gradle Plugin usa a assinatura debug padrao local quando o build debug e executado no Android Studio

Isso significa:
- `debug` esta pronto para uso local
- `release` ainda nao esta configurado com assinatura propria do projeto

## Release signing — situacao atual
A assinatura release ainda esta pendente.

No estado atual:
- nao existe `signingConfigs` em [app/build.gradle](/home/andre/projects/leidy-cleaner-services/apps/frontend/android/app/build.gradle)
- nao existe `key.properties` versionado
- nao existe keystore release no repositório

Isso e esperado neste momento.

## Segredos e arquivos locais
Nao versionar:
- `*.jks`
- `*.keystore`
- `key.properties`
- `signing.properties`
- `local.properties`

Esses arquivos devem ficar:
- ignorados pelo Git
- locais por maquina
- fora de commits e PRs

## Passo manual — gerar APK debug

### Opcao recomendada: Android Studio
1. Abrir `apps/frontend/android` no Android Studio.
2. Rodar `Gradle sync`.
3. No projeto `app`, abrir:
   `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`.
4. Aguardar a conclusao.

Resultado esperado:
- APK debug gerado
- caminho tipico:
  `apps/frontend/android/app/build/outputs/apk/debug/app-debug.apk`

### Atualizar o frontend antes do build
Antes de abrir o Android Studio para um novo teste:

```bash
npm run build
node node_modules/@capacitor/cli/bin/capacitor sync android
```

## Passo manual — instalar APK debug

### Opcao A: direto pelo Android Studio
1. Selecionar emulador ou aparelho fisico.
2. Clicar em `Run`.

Resultado esperado:
- Android Studio instala a variante debug
- app abre no dispositivo

### Opcao B: instalar o APK manualmente
1. Localizar `app-debug.apk`.
2. Transferir o arquivo para o aparelho.
3. Permitir instalacao manual se o Android solicitar.
4. Abrir o APK e concluir a instalacao.

## Passo manual — criar keystore release

### Opcao recomendada: Android Studio
1. Abrir:
   `Build` → `Generate Signed Bundle / APK...`
2. Escolher `Android App Bundle` ou `APK`.
3. Clicar em `Create new...`.
4. Informar:
   - local do arquivo `.jks`
   - senha do keystore
   - alias da chave
   - senha da chave
   - validade e dados de organizacao

Recomendacao:
- guardar o `.jks` fora do repositório, ou em pasta local ignorada
- registrar senhas em cofre seguro da equipe

### Opcao por linha de comando
Exemplo manual de criacao:

```bash
keytool -genkeypair -v \
  -keystore leidy-cleaner-profissional-release.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias leidy-cleaner-profissional
```

Observacao:
- substituir nome/caminho conforme a maquina local
- nao commitar esse arquivo

## Passo manual — configurar assinatura local sem commitar segredos

### Opcao sem alterar o Gradle agora
Usar o proprio wizard do Android Studio em cada build release.

Vantagem:
- nenhuma senha vai para o Git
- nenhuma configuracao de assinatura precisa entrar no projeto agora

### Opcao com arquivo local ignorado
Se a equipe quiser padronizar localmente no futuro, criar um arquivo local nao versionado:

`apps/frontend/android/key.properties`

Exemplo:

```properties
storeFile=/caminho/local/para/leidy-cleaner-profissional-release.jks
storePassword=SENHA_DO_KEYSTORE
keyAlias=leidy-cleaner-profissional
keyPassword=SENHA_DA_CHAVE
```

Importante:
- manter esse arquivo somente na maquina local
- nao commitar
- nao enviar por chat ou ticket

## Passo manual — gerar AAB release no Android Studio
1. Abrir:
   `Build` → `Generate Signed Bundle / APK...`
2. Escolher `Android App Bundle`.
3. Informar o keystore release.
4. Selecionar a variante `release`.
5. Finalizar o wizard.

Resultado esperado:
- AAB release gerado
- caminho tipico:
  `apps/frontend/android/app/build/outputs/bundle/release/app-release.aab`

## Checklist manual

### Debug
- [ ] `npm run build` executado localmente
- [ ] `node node_modules/@capacitor/cli/bin/capacitor sync android` executado localmente
- [ ] `Gradle sync` concluido
- [ ] `Build APK(s)` concluido
- [ ] `app-debug.apk` localizado
- [ ] APK debug instalado no dispositivo

### Release
- [ ] keystore release criado localmente
- [ ] keystore armazenado fora do Git
- [ ] senhas armazenadas em local seguro
- [ ] `Generate Signed Bundle / APK` executado manualmente
- [ ] `app-release.aab` gerado manualmente

## O que continua pendente
Mesmo com este preparo documental, continuam pendentes:
- assinatura release validada de ponta a ponta
- teste do AAB em fluxo real de distribuicao
- Play Store
- automacao futura de build/signing, se desejada
