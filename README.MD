# Bot WhatsApp em TypeScript

**Whatsapp-bot-typescript** é um bot de automação do WhatsApp robusto e modular, construído com TypeScript e Baileys. Projetado para atendimento automatizado ao cliente ("Sistema de atendimento automatizado via WhatsApp"), ele gerencia conexões seguras em múltiplos dispositivos, interações baseadas em comandos, processamento de mídia (por exemplo, geração de figurinhas) e envio para contatos em whitelist. Pode ser facilmente estendido para bots personalizados, notificações ou sistemas de suporte com lógica de reconexão e registro detalhado.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-blue.svg?logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg?logo=typescript)](https://www.typescriptlang.org)
[![Baileys](https://img.shields.io/badge/Baileys-6.7.19-green.svg)](https://github.com/WhiskeySockets/Baileys)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

## Recursos

- **Conexão Multi-Dispositivo WhatsApp**: Pareamento via código (sem necessidade de escanear QR), reconexão automática em falhas.
- **Sistema de Comandos**: Comandos baseados em prefixo (ex.: `.s` para figurinhas) com fácil extensão.
- **Gerador de Figurinhas**: Converte imagens/vídeos citados em figurinhas usando `wa-sticker-formatter`.
- **Segurança**: Apenas números em whitelist são permitidos; ignora grupos, mensagens próprias e status.
- **Logs e Utilitários**: Logs coloridos no console, parsing de mensagens, manipulação de mídia, delays de espera.
- **Tratamento Robusto de Erros**: Reconexões controladas para desconexões comuns (ex.: timeouts, perda de conexão).
- **Suporte a Mídia**: Imagens, vídeos, áudio, textos longos com legendas.

## Stack Tecnológico

| Categoria                  | Tecnologias                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| **Runtime**                | Node.js 18+, TypeScript 5.9                                                               |
| **API do WhatsApp**        | [@whiskeysockets/baileys@6.7.19](https://github.com/WhiskeySockets/Baileys)               |
| **Processamento de Mídia** | [wa-sticker-formatter](https://www.npmjs.com/package/wa-sticker-formatter), fluent-ffmpeg |
| **Utils**                  | dotenv, pino (logger), moment-timezone, axios, chalk                                      |
| **Ferramentas de Dev**     | tsc, ts-node-dev, ESLint + Prettier, Jest                                                 |
| **Build**                  | Módulos ES2023, configuração TypeScript estrita                                           |

## Instalação e Uso

1. **Clonar e Instalar**:

   ```bash
   git clone https://github.com/speNillusion/whatsapp-bot-typescript.git
   cd whatsapp-bot-typescript
   npm install
   ```

2. **Configurar**:
   - Copie `.env.example` para `.env` (crie se não existir):
     ```env
     PREFIX=.
     ```
   - Edite `src/configs/constants.ts` para adicionar JIDs permitidos (por exemplo, `"5511999999999@s.whatsapp.net": true`).

3. **Executar**:
   - **Desenvolvimento** (com hot reload): `npm run dev`
   - **Build & Produção**: `npm run build && npm start`
   - Na primeira execução, insira seu número de telefone (ex.: `+5512999999999`) para o código de pareamento.

4. **Comandos** (prefixo padrão `.`):
   - `.s` ou `.sticker`: Responda a uma imagem/vídeo para gerar figurinhas.

   **Exemplo**:

   ```
   User: [quotes image] .s
   Bot: [sends sticker]
   ```

5. **Outros Scripts**:
   ```bash
   npm run lint     # Lint código
   npm run format   # Formatar código
   npm run clean    # Limpar dist/
   npm run test     # Rodar testes (configurar conforme necessário)
   ```

## Estrutura do Projeto

```
whatsapp-bot-typescript/
├── package.json
├── tsconfig.json
├── src/
│   ├── configs/          # Utilitários centrais e tipos
│   │   ├── constants.ts  # Env, prefixes, whitelists, cores
│   │   ├── functions.ts  # Helpers: logMessage, sendText/Image/Audio, normalizar
│   │   ├── interfaces.ts # Parâmetros de log, tipos de dados
│   │   └── types.ts      # Tipos customizados (ex.: permitedNumbersType)
│   ├── index.ts          # Entrada: inicializa Connection & MessageHandler
│   └── service/          # Lógica de negócio
│       ├── Connection.ts # Autenticação WhatsApp, eventos, reconexões
│       ├── MessageHandler.ts # Eventos de mensagens, switch de comandos
│       └── ServiceListener.ts # Faz parsing das mensagens (body, sender, quoted, etc.)
└── session/              # Pasta de auth gerada automaticamente
```

## Trechos de Código

**Adicionando um Novo Comando** (no `MessageHandler.ts` switch):

```typescript
case 'ping':
  await client.sendMessage(serviceListener.getFrom, { text: 'Pong! 🏓' });
  break;
```

**Resposta sem Prefixo** (após o switch):

```typescript
if (serviceListener.getBody?.includes("oi")) {
  await client.sendMessage(serviceListener.getFrom, {
    text: "Olá! Como posso ajudar?",
  });
}
```

**Enviar para Contatos na Whitelist**:

```typescript
// From functions.ts
await sendTextMessageToContacts(client, from, ["5534999999999"], "Hello!");
```

## Roteiro

- Core de conexão e comando de figurinhas implementados.
- **Em Andamento/Planejado**:
  - Mais comandos (ex.: `.sender`, broadcasts).
  - Respostas não baseadas em prefixo com IA (ex.: saudações).
  - Encaminhamento completo de mídia (áudio, documentos).
  - Integração com banco de dados (SQLite/Mongo para logs/conversas).
  - Testes unitários com Jest.
  - Suporte a Docker.
  - Painel web para comandos/config.

Contribuições são bem-vindas! Faça fork, PR ou abra issues. Reporte bugs para speNillusion.

**Licença**: MIT | **Autor**: speNillusion
