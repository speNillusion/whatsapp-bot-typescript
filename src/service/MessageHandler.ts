/** @format */

/**
 * Serviço para manipulação de mensagens.
 */
import { createSticker } from "wa-sticker-formatter";
import { RED, time, date, permitedNumbers, GREEN, RESET } from "../configs/constants";
import { logMessage, getSender } from "../configs/functions";
import { Connection } from "./Connection";
import { ServiceListener } from "./ServiceListener";
import {
  WASocket,
  WAMessage,
  MessageUpsertType,
  downloadContentFromMessage,
  MediaType,
} from "@whiskeysockets/baileys";

/**
 * Classe para manipulação de mensagens.
 */
export class MessageHandler extends Connection {
  constructor() {
    super();
  }

  /**
   * Manipula as mensagens recebidas.ss
   *
   * @param client - O cliente do Baileys.
   * @param store - O store do Baileys.
   */
  public async handleMessage(client: WASocket) {
    client.ev.on(
      "messages.upsert",
      async (event: {
        messages: WAMessage[];
        type: MessageUpsertType;
        requestId?: string | undefined;
      }) => {
        const serviceListener = new ServiceListener(event);
        await serviceListener.init(client);

        // barrer de conversas apenas para o número específico
        if (
          !serviceListener.getFromMe &&
          !permitedNumbers[serviceListener.getFrom]
        ) {
          console.log(`${RED}Mensagem ignorada de ${serviceListener.getFrom}`);
          return;
        }

        // nao responde grupos
        if (serviceListener.getIsGroup) return;
        // nao responde as mensagens de si mesmo
        if (serviceListener.getIsBot) return;

        // barrer para status
        if (!serviceListener.getInfo?.message) return;
        if (serviceListener.getInfo?.key.remoteJid === "status@broadcast")
          return;

        // Call the logging function with destructured parameters
        logMessage({
          isGroup: serviceListener.getIsGroup,
          isCmd: serviceListener.getIsCmd,
          isBot: serviceListener.getIsBot,
          command: serviceListener.getCommand,
          sender: serviceListener.getSender,
          groupName: serviceListener.getGroupName,
          pushname: serviceListener.getPushname,
          time,
          date,
        });

        /**
         * Swith para colocar os comandos.
         * ${PREFIX} .env.example PREFIX
         * * @example
         * ${PREFIX}sender = Vai chamar a função sender aqui dentro.
         */
        switch (serviceListener.getCommand) {

          // comando de Brinde: criar figurinhas
          case "s":
          case "sticker": // Alias opcional
            try {
              // 1. Acessa a mensagem citada com segurança
              const msg = serviceListener.getMessages[0];
              const quotedMsg =
                msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage;

              if (!quotedMsg) {
                await client.sendMessage(serviceListener.getFrom, {
                  text: "❌ Erro: Marque uma imagem ou vídeo para fazer a figurinha.",
                });
                break;
              }

              // 2. Determina o tipo e o conteúdo
              let mediaType: MediaType | undefined;
              let mediaContent: any;

              if (quotedMsg.imageMessage) {
                mediaType = "image";
                mediaContent = quotedMsg.imageMessage;
              } else if (quotedMsg.videoMessage) {
                mediaType = "video";
                mediaContent = quotedMsg.videoMessage;
              }

              // 3. Se encontrou mídia válida, processa
              if (mediaType && mediaContent) {
                // Notifica que está processando (opcional, boa UX)
                // await client.sendPresenceUpdate('composing', serviceListener.getFrom);

                const stream = await downloadContentFromMessage(
                  mediaContent,
                  mediaType
                );

                // 4. Converte Stream para Buffer
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                  buffer = Buffer.concat([buffer, chunk]);
                }

                // 5. Cria a figurinha
                // Nota: Certifique-se que sua função createSticker aceita Buffer
                const sticker = await createSticker(buffer, {
                  pack: "Bot-whatsapp", // Pack Name
                  author: "speNillusion", // Author Name
                  type: "full", // 'full' | 'crop' | 'circle' (depende da lib usada)
                  quality: 60, // Qualidade para não ficar pesado
                });

                if (sticker) {
                  await client.sendMessage(
                    serviceListener.getFrom,
                    { sticker: sticker },
                    { quoted: serviceListener.getInfo }
                  );
                  console.log(`${GREEN}[SUCESSO] - Figurinha enviada.${RESET}`);
                } else {
                  throw new Error("Falha na geração do arquivo webp.");
                }
              } else {
                // Caso tenha marcado um texto ou áudio
                await client.sendMessage(serviceListener.getFrom, {
                  text: "⚠️ A mensagem marcada não contém imagem ou vídeo.",
                });
              }
            } catch (error) {
              console.error(
                `${RED}[ERRO] - Falha ao criar figurinha:${RESET}`,
                error
              );
              await client.sendMessage(serviceListener.getFrom, {
                text: "Ocorreu um erro ao processar sua figurinha.",
              });
            }
            break;
        }

        /**
         * A partir do If de Barrer são os comandos sem prefixo.
         * * @example
         * Oi tudo bem? = Vai retornar o que ele foi programado para fazer.
         */
        if (serviceListener.getIsCmd) return;

        /**
         * Apenas um exemplo, bem básico!
         * * @example
         * captura o corpo da mensagem: Oi tudo bem?
         * const msg: string = serviceListener.getBody!
         * if (msg.includes("tudo bem")) {
         * * envia a mensagem
         * * * await client.sendMessage(serviceListener.getFrom, {
         * * * text: "Tudo ótimo, e você?"
         * * });
         * }
         */
      },
    );
  }
}
