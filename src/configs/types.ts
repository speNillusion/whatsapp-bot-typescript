/**
 * Weeks day.
 *
 * @format
 */

import { WASocket } from "@whiskeysockets/baileys/lib";


export type diaSemanaType = {
  [key in number]: string;
};

export type Client = WASocket

/**

 * 
 * Permited Numbers to send messages.
 * 
 * @param {string} jid - O ID do contato.
 * @param {boolean} value - Se é permitido enviar mensagens para este contato.
 * 
 * @example
 * {
 *  "5511912345678@s.whatsapp.net": true,
 *  "5511987654321@s.whatsapp.net": false,
 * }
 * 
 * @description
 * `true`: Permitido enviar mensagens.
 * 
 * `false`: Não permitido enviar mensagens.
 */
export type permitedNumbersType = {
  [jid: string]: boolean;
};

/**
 * Prefixo para comandos do bot.
 */
export type prefixType = string;

/**
 * Log level.
 */
export type logLevelType = "info" | "debug" | "error" | "silent";
