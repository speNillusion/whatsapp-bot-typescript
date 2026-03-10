/** @format */
import { config } from "dotenv";
import moment from "moment-timezone";
import readline from "readline";
import {
  diaSemanaType,
  permitedNumbersType,
  prefixType,
  logLevelType,
} from "./types";
config();

/**
 * Constantes do bot
 **/

/**
 * Horário atual no fuso horário de São Paulo.
 */
export const time = String(moment.tz("America/Sao_Paulo").format("HH:mm:ss"));
/**
 * Data atual no fuso horário de São Paulo.
 */
export const date = String(moment.tz("America/Sao_Paulo").format("DD/MM/YY"));
/**
 * Dia da semana atual no fuso horário de São Paulo.
 */
export const dayOfWeek: number = moment.tz("America/Sao_Paulo").day(); // 0=Sunday, 6=Saturday
/**
 * Nome do dia da semana atual no fuso horário de São Paulo.
 */
export const diasSemana: diaSemanaType = {
  0: "segunda",
  1: "terça",
  2: "quarta",
  3: "quinta",
  4: "sexta",
  5: "sábado",
  6: "domingo",
};

/**
 * Prefixo para comandos do bot.
 */
export const PREFIX: prefixType = process.env.PREFIX || ".";

/**
 * Tempo de espera entre cada mensagem enviada para um contato.
 */
export const SLEEP_MSG_MS: number = 1000;

/**
 * Números permitidos para envio de mensagens.
 * A chave deve ser o JID do WhatsApp e o valor um booleano.
 * * @example
 * { "553499999999@s.whatsapp.net": true }
 */
export const permitedNumbers: permitedNumbersType = {
  "553499999999@s.whatsapp.net": true,
  "553466666666@s.whatsapp.net": true,
};

/**
 * Cores para log de mensagens.
 */
export const { GREEN, RESET, CYAN, YELLOW, BLUE, RED } = {
  GREEN: "\x1b[32m",
  RESET: "\x1b[0m",
  CYAN: "\x1b[36m",
  YELLOW: "\x1b[33m",
  BLUE: "\x1b[34m",
  RED: "\x1b[31m",
};

/**
 * Interface para entrada de dados via console.
 */
export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Nível de log para mensagens.
 */
export const LOG_LEVEL: logLevelType = "silent";
