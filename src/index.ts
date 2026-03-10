/** @format */

import { Client } from "./configs/types";
import { Connection } from "./service/Connection";
import { MessageHandler } from "./service/MessageHandler";

/**
 * Classe principal para inicialização do bot.
 */
export class Main {
  private client!: Client;

  constructor() {}
  /**
   * Inicializa o bot, conectando ao WhatsApp e manipulando mensagens.
   */
  public async start() {
    try {
      //initialize the connection
      const { client } = await new Connection().connectToWhatsApp();
      this.client = client as Client;

      //initialize the message handler
      await new MessageHandler().handleMessage(this.client);
    } catch (error) {
      throw new Error("Erro ao conectar ao WhatsApp: " + error);
    }
  }
}

new Main().start();
