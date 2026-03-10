/** @format */
/**
 * Interfaces do bot
 */

/**
 * Parâmetros para log de mensagens.
 */
export interface LogMessageParams {
  isGroup: Boolean;
  isCmd: Boolean;
  isBot: Boolean;
  command: String | null;
  sender: String;
  groupName: String;
  pushname: String;
  time: String;
  date: String;
}

/**
 * Dados básicos para log de mensagens.
 */
export interface BaseLogData {
  número: String;
  nome: String;
  time: String;
  data: String;
  grupo?: String;
  comando?: String | null;
}
