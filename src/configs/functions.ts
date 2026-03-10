/** @format */

import { config } from "dotenv";
import { BLUE, RED, RESET, SLEEP_MSG_MS } from "../configs/constants";
import fs from "fs/promises";
import { diasSemana } from "../configs/constants";
import { BaseLogData, LogMessageParams } from "./interfaces";
import { generateWAMessageFromContent } from "@whiskeysockets/baileys/lib";
import { WASocket } from "@whiskeysockets/baileys";
config();

/**
 * Funções utilitárias do bot
 */

/**
 * Returns the Portuguese weekday name for a given numeric day (0=Sunday … 6=Saturday)
 * @param {number} dayOfWeekNumber - The numeric day of the week (0-6).
 * @returns {string} The Portuguese weekday name.
 **/
export function diaSemana(dayOfWeekNumber: number): string {
  return diasSemana[dayOfWeekNumber];
}

/**
 * Converts a stream to a buffer asynchronously.
 * @param {any} stream - The stream to be converted.
 * @returns {Promise<Buffer>} A promise that resolves with the converted buffer.
 **/
export async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Deletes a file asynchronously.
 * @param {string} filePath - The path of the file to be deleted.
 * @returns {Promise<void>} A promise that resolves when the file is successfully deleted.
 **/
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
    console.log(`Arquivo ${filePath} deletado com sucesso!`);
  } catch (error: any) {
    console.error("Erro ao deletar o arquivo:", error);
    // Você pode verificar o código do erro, por exemplo, se o arquivo não existe (ENOENT)
    if (error.code === "ENOENT") {
      console.log("O arquivo não foi encontrado.");
    }
  }
}

/**
 * Normalizes a string by removing accents and converting to lowercase.
 * @param {string} texto - The string to be normalized.
 * @param {boolean} [keepCase=false] - Whether to keep the original case.
 * @returns {Promise<string>} The normalized string.
 **/
export async function normalizar(
  texto: string,
  keepCase: boolean = false
): Promise<string> {
  if (!texto || typeof texto !== "string") return "";
  const normalizedText = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return keepCase ? normalizedText : normalizedText.toLowerCase();
}

/**
 * Extracts the text content from a message object, handling various message types.
 * @param {any} message - The message object to extract text from.
 * @returns {Promise<string>} The extracted text content.
 **/
export const getMessageText = async (message: any): Promise<string> => {
  if (!message) return "";
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    message.documentWithCaptionMessage?.message?.documentMessage?.caption ||
    message.viewOnceMessage?.message?.imageMessage?.caption ||
    message.viewOnceMessage?.message?.videoMessage?.caption ||
    message.viewOnceMessageV2?.message?.imageMessage?.caption ||
    message.viewOnceMessageV2?.message?.videoMessage?.caption ||
    message.editedMessage?.message?.protocolMessage?.editedMessage
      ?.extendedTextMessage?.text ||
    message.editedMessage?.message?.protocolMessage?.editedMessage?.imageMessage
      ?.caption ||
    ""
  );
};

/**
 * Delays the execution of a promise for a specified amount of time.
 * @param {number} ms - The delay time in milliseconds.
 * @returns {Promise<void>} A promise that resolves after the specified delay.
 **/
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determines the type of message based on its properties.
 * @param {boolean} isQuotedMsg - Whether the message is a quoted message.
 * @param {boolean} isQuotedMsgWithImg - Whether the message is a quoted message with an image.
 * @param {boolean} isQuotedImage - Whether the message is a quoted image.
 * @returns {Promise<string>} The type of message.
 **/
export const options = async (
  isQuotedMsg: boolean,
  isQuotedMsgWithImg: boolean,
  isQuotedImage: boolean,
  isExtendedTextMessage: boolean,
  isQuotedAudio: boolean
): Promise<string> => {
  if (isQuotedMsg && !sendExtendedTextMessageToContacts) return "isQuotedMsg";
  if (isQuotedMsgWithImg) return "isQuotedMsgWithImg";
  if (isQuotedImage && !isQuotedMsgWithImg) return "isQuotedImage";
  if (isExtendedTextMessage) return "isExtendedTextMessage";
  if (isQuotedAudio) return "isQuotedAudio";
  return "unknown";
};

/**
 * Sends typing indicators to a contact for a specified duration.
 * @param {WASocket} client - The WhatsApp client instance.
 * @param {string} from - The sender's WhatsApp ID.
 * @param {number} amount - The duration (in seconds) for which typing indicators should be sent.
 * @returns {Promise<void>} A promise that resolves after the typing indicators are sent.
 **/
export async function escrevendo(
  client: WASocket,
  from: string,
  amount: number
): Promise<void> {
  for (let i = 0; i < amount; i++) {
    await client.sendPresenceUpdate("composing", from);
  }
}

/**
 * Sends an image with a caption to a list of contacts.
 * @param {WASocket} client - The WhatsApp client instance.
 * @param {string} from - The sender's WhatsApp ID.
 * @param {string[]} contacts - The list of recipient WhatsApp IDs.
 * @param {Buffer} buffer - The image buffer to be sent.
 * @param {string} [caption=""] - The caption for the image (default is empty string).
 * @returns {Promise<void>} A promise that resolves after the image is sent.
 **/
export async function sendImgTxtMessageToContacts(
  client: WASocket,
  from: string,
  contacts: string[],
  buffer: Buffer,
  caption: string = ""
): Promise<void> {
  if (!contacts || (contacts.length <= 1 && contacts[0] === "")) {
    console.log(`${RED}Lista de contatos vazia.`);
    return;
  }

  if (typeof buffer !== "object" || typeof caption !== "string") {
    await client.sendMessage(from, {
      text: "Mensagem inválida. Falta buffer da imagem ou a legenda.",
    });
    return;
  }

  for (const contact of contacts) {
    if (contact !== "") {
      await client.sendMessage(contact + "@s.whatsapp.net", {
        image: buffer,
        caption: caption.trim() !== "" ? caption : "",
      });
      await sleep(SLEEP_MSG_MS);
    }
  }
}

/**
 * Extracts the sender's WhatsApp ID from a message object, handling both group and non-group messages.
 * @param {boolean} isGroup - Whether the message is from a group.
 * @param {any} info - The message object containing sender information.
 * @returns {Promise<string>} The sender's WhatsApp ID.
 **/
export async function getSender(isGroup: boolean, info: any): Promise<string> {
  if (!info) return "The function is empty on isGroup or info";
  try {
    if (isGroup) {
      const response = info.key.participant || "";
      if (response) {
        return response;
      } else {
        return "";
      }
    } else {
      return info.key.senderPn || "55xxxxxxxxxx@s.whatsapp.net";
    }
  } catch (error) {
    console.error(error);
  }
  return "";
}

/**
 * Retrieves the group name from group metadata.
 * @param {boolean} isGroup - Indicates if the message is from a group.
 * @param {Function} groupMetadata - Function to retrieve group metadata.
 * @returns {Promise<string>} The name of the group, or an empty string if not a group or name not found.
 */
export async function getGroupName(
  isGroup: boolean,
  groupMetadata: () => Promise<any>
): Promise<string> {
  if (!isGroup) {
    return "";
  }
  try {
    const metadata = await groupMetadata();
    return metadata.subject || "";
  } catch (error) {
    console.error("Error getting group name:", error);
    return "";
  }
}

/**
 * Extracts the command from a message body, normalizes it, and returns it.
 * @param {boolean} isCmd - Whether the message is a command.
 * @param {string} body - The message body containing the command.
 * @param {string} prefix - The command prefix to be removed.
 * @returns {Promise<string>} The normalized command.
 **/
export async function getCommand(
  isCmd: boolean,
  body: string,
  prefix: string
): Promise<string> {
  if (!body || !prefix) return "The function is empty on body or prefix";
  try {
    if (isCmd) {
      let supraSume: string | any = body
        .trim()
        .slice(prefix.length)
        .split(/ +/)
        .shift()
        ?.trim();
      const response = await normalizar(supraSume || "");
      if (response) {
        return response.replace(/\s+/g, "");
      } else {
        return "";
      }
    } else {
      return "";
    }
  } catch (error) {
    console.error(error);
  }
  return "";
}

/**
 * Sends an audio file with a caption to a list of contacts.
 * @param {WASocket} client - The WhatsApp client instance.
 * @param {string} from - The sender's WhatsApp ID.
 * @param {string[]} contacts - The list of recipient WhatsApp IDs.
 * @param {Buffer} buffer - The audio buffer to be sent.
 * @returns {Promise<void>} A promise that resolves after the audio is sent.
 **/
export async function sendAudioTextToContacts(
  client: WASocket,
  from: string,
  contacts: string[],
  buffer: Buffer
): Promise<void> {
  if (!contacts || (contacts.length <= 1 && contacts[0] === "")) {
    console.log(`${RED}Lista de contatos vazia.`);
    return;
  }

  if (typeof buffer !== "object") {
    await client.sendMessage(from, {
      text: "Mensagem inválida. Falta buffer da imagem ou a legenda.",
    });
    return;
  }

  for (const contact of contacts) {
    if (contact !== "") {
      await client.sendMessage(contact + "@s.whatsapp.net", {
        audio: buffer,
        mimetype: "audio/ogg; codecs=opus",
        ptt: true,
      });
      await sleep(SLEEP_MSG_MS);
    }
  }
}

/**
 * Sends a text message to a list of contacts.
 * @param {WASocket} client - The WhatsApp client instance.
 * @param {string} from - The sender's WhatsApp ID.
 * @param {string[]} contacts - The list of recipient WhatsApp IDs.
 * @param {string} message - The message to be sent.
 * @returns {Promise<void>} A promise that resolves after the messages are sent.
 **/
export async function sendTextMessageToContacts(
  client: WASocket,
  from: string,
  contacts: string[],
  message: string
): Promise<void> {
  if (!contacts || (contacts.length <= 1 && contacts[0] === "")) {
    console.log(`${RED}Lista de contatos vazia.`);
    return;
  }
  if (typeof message !== "string") {
    await client.sendMessage(from, {
      text: "Mensagem inválida. Somente aceita mensagens de Texto.",
    });
    return;
  }
  for (const contact of contacts) {
    if (contact !== "") {
      await client.sendMessage(contact + "@s.whatsapp.net", {
        text: message,
      });
      await sleep(SLEEP_MSG_MS);
    }
  }
}

/**
 * Sends an extended text message (with links, mentions, etc.) to a list of contacts.
 * @param {WASocket} client - The WhatsApp client instance.
 * @param {string} from - The sender's WhatsApp ID.
 * @param {string[]} contacts - The list of recipient WhatsApp IDs.
 * @param {object} content - The content of the extended text message.
 * @param {object[]} messages - The list of messages to be quoted.
 * @returns {Promise<void>} A promise that resolves after the messages are sent.
 **/
export async function sendExtendedTextMessageToContacts(
  client: WASocket,
  from: string,
  contacts: string[],
  content: object,
  messages: object[]
): Promise<void> {
  if (!contacts || (contacts.length <= 1 && contacts[0] === "")) {
    console.log(`${RED}Lista de contatos vazia.`);
    return;
  }

  if (typeof content !== "object") {
    await client.sendMessage(from, {
      text: "Mensagem inválida. Somente aceita mensagens de Texto.",
    });
    return;
  }

  if (!content) {
    console.error("Nenhuma mensagem citada encontrada para retransmissão.");
    return;
  }

  const message = generateWAMessageFromContent(from, content, {
    userJid: from,
  });

  const iMessage = message.message;

  const messageProtobuf: any = iMessage;

  const relayOptions = {
    messageId: message.key.id || "",
    quoted: messages[0],
    timestamp: Date.now(),
  };

  for (const contact of contacts) {
    if (contact !== "") {
      await client.relayMessage(
        contact + "@s.whatsapp.net",
        messageProtobuf,
        relayOptions
      );
      await sleep(SLEEP_MSG_MS);
    }
  }
}

/**
 * Logs a message with specified parameters.
 * @param {LogMessageParams} params - The parameters for logging the message.
 * @returns {Promise<void>} A promise that resolves after the message is logged.
 **/
export const logMessage = async ({
  isGroup,
  isCmd,
  isBot,
  command,
  sender,
  groupName,
  pushname,
  time,
  date,
}: LogMessageParams): Promise<void> => {
  if (isBot) return; // Early return for bot messages

  try {
    const messageType = isGroup ? "Grupo" : "Privado";
    const baseLogData: BaseLogData = {
      número: sender?.split("@")[0] || "Unknown",
      nome: pushname || "Unknown",
      time,
      data: date,
    };

    if (isGroup) {
      baseLogData.grupo = groupName;
    }

    if (isCmd) {
      baseLogData.comando = command;
    }

    // Build formatted log message
    const logEntries = Object.entries(baseLogData)
      .map(([key, value]) => `${RED}${key}:${RESET} ${value}`)
      .join("\n");

    console.log(`${BLUE}Mensagem no ${messageType}${RESET}\n${logEntries}\n`);
  } catch (error) {
    console.error(`${RED}Error logging message:${RESET}`, error);
  }
};
