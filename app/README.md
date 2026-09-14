# WebView Push App

Aplicativo React Native com Expo para Android e iOS.

## O que ele faz

- Abre um site dentro de uma WebView.
- Solicita permissão para notificações.
- Obtém o Expo Push Token do aparelho.
- Envia o token para sua API em `POST /api/push/register`.
- Abre uma URL da WebView quando o usuário toca em uma notificação.
- Abre links externos no navegador.
- Trata o botão voltar do Android.
- Mostra tela de erro e botão para recarregar.

## 1. Configuração

Edite `app.json`.

Troque:

- `expo.name`
- `expo.slug`
- `expo.ios.bundleIdentifier`
- `expo.android.package`
- `expo.extra.siteUrl`
- `expo.extra.apiUrl`
- `expo.extra.eas.projectId`

Exemplo:

```json
"extra": {
  "siteUrl": "https://meusite.com.br",
  "apiUrl": "https://meusite.com.br",
  "eas": {
    "projectId": "SEU-PROJECT-ID"
  }
}
```

A API pode estar no mesmo domínio do site.

## 2. Instalação

Requer Node.js 22.13 ou superior para Expo SDK 57.

```bash
npm install
npx expo-doctor
```

## 3. Criar projeto no Expo/EAS

```bash
npx eas-cli@latest login
npx eas-cli@latest init
```

O comando gera/associa um `projectId`. Coloque esse valor em `expo.extra.eas.projectId`.

## 4. Teste

Push remoto precisa ser testado em aparelho físico.

Android:

```bash
npx eas-cli@latest build -p android --profile preview
```

iOS:

```bash
npx eas-cli@latest build -p ios --profile preview
```

## 5. Produção

```bash
npx eas-cli@latest build -p android --profile production
npx eas-cli@latest build -p ios --profile production
```

Envio para as lojas:

```bash
npx eas-cli@latest submit -p android --profile production
npx eas-cli@latest submit -p ios --profile production
```

## 6. API de exemplo

A pasta `backend-example` contém dois endpoints:

- `POST /api/push/register`
- `POST /api/push/send`

Instalação:

```bash
cd backend-example
npm install
npm start
```

Registrar token:

```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "android",
  "device": "Pixel"
}
```

Enviar para um aparelho:

```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "title": "Pedido atualizado",
  "body": "Seu pedido mudou de status.",
  "url": "/pedidos/123"
}
```

Enviar para todos os tokens registrados:

```json
{
  "title": "Aviso",
  "body": "Temos uma novidade para você.",
  "url": "/novidades"
}
```

O exemplo usa memória apenas para demonstrar. Em produção, grave os tokens no PostgreSQL/MySQL/etc. e associe cada token ao usuário correto.

## 7. Credenciais de push

Para builds reais, configure as credenciais de push do Android (FCM V1) e iOS (APNs) no EAS.

## 8. Observação sobre App Store

No iOS, não dependa de uma WebView sem nenhuma integração nativa. Mantenha notificações, abertura de conteúdo por push, tratamento nativo de links, estados de carregamento/erro e, de preferência, outras funcionalidades nativas úteis ao produto.
