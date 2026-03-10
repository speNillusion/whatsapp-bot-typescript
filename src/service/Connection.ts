/** @format */
/**
 * Serviço para conexão com o WhatsApp.
 */
import P from "pino";
import { Boom } from "@hapi/boom";
import {
  GREEN,
  RESET,
  YELLOW,
  RED,
  CYAN,
  rl,
  LOG_LEVEL,
} from "../configs/constants";
import makeInMemoryStore, {
  ConnectionState,
  WASocket,
  default as makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  SignalDataTypeMap,
  SignalDataSet,
} from "@whiskeysockets/baileys";

/**
 * Classe abstrata para conexão com o WhatsApp.
 */
export class Connection {
  constructor() {}

  public async connectToWhatsApp(): Promise<{ client: WASocket; store: ReturnType<typeof makeInMemoryStore> }> {
    try {
      const { state, saveCreds } = await useMultiFileAuthState("session");

      const { version } = await fetchLatestBaileysVersion();

      const logger = P({ level: LOG_LEVEL });

      const client: WASocket = makeWASocket({
        version,
        logger,
        printQRInTerminal: false,
        auth: state,
        emitOwnEvents: true,
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
      });

      if (!client.authState.creds.registered) {
        rl.question(
          `${CYAN}Digite seu número (+55 12 99999-9999): ${RESET}`,
          async (phoneInput: string) => {
            rl.close();
            const phoneNumber = phoneInput.replace(/\D/g, "");
            try {
              const code = await client.requestPairingCode(phoneNumber);
              console.log(
                `${GREEN}Código de pareamento gerado: ${code}${RESET}`,
              );
            } catch (err) {
              console.error(
                `${RED}Erro ao gerar código de pareamento:`,
                err,
                RESET,
              );
            }
          },
        );
      }

      const store = makeInMemoryStore({
        logger: logger.child({ level: "silent", stream: "store" }),
        auth: {
          creds: state.creds,
          keys: {
            get: function <T extends keyof SignalDataTypeMap>(
              type: T,
              ids: string[],
            ):
              | { [id: string]: SignalDataTypeMap[T] }
              | Promise<{ [id: string]: SignalDataTypeMap[T] }> {
              throw new Error("Function not implemented.");
            },
            set: function (data: SignalDataSet): void | Promise<void> {
              throw new Error("Function not implemented.");
            },
            clear: void 0,
          },
        },
      });

      client.ev.on(
        "connection.update",
        async (update: Partial<ConnectionState>) => {
          const { connection, lastDisconnect } = update;

          if (connection === "open") {
            console.log(
              `${GREEN}[CONECTADO] - Bot conectado e reagiu com sucesso.${RESET}`,
            );
          }

          if (connection === "close") {
            // Extrai o código de erro de forma segura
            const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;

            console.log(
              `${RED}[RECONECTANDO] - Razão ${reason}: ${lastDisconnect?.error}${RESET}`,
            );

            switch (reason) {
              // === CASOS DE RECONEXÃO AUTOMÁTICA ===
              case DisconnectReason.connectionClosed:
              case DisconnectReason.connectionLost:
              case DisconnectReason.timedOut:
              case DisconnectReason.restartRequired:
              // Nota: connectionReplaced geralmente não deve reconectar automaticamente
              // para evitar conflito de sessões, mas mantive conforme seu código original.
              case DisconnectReason.connectionReplaced:
                this.connectToWhatsApp();
                break;

              // === CASOS TERMINAIS (NÃO RECONECTAR) ===
              case DisconnectReason.loggedOut:
                console.log(
                  `${RED}[DESCONECTADO] - Dispositivo desconectado (Logout).${RESET}`,
                );
                client.ws.close();
                break;

              case DisconnectReason.badSession:
                console.log(
                  `${RED}[ERRO CRÍTICO] - Arquivo de sessão corrompido.${RESET}`,
                );
                // Sugestão: Limpar pasta auth aqui
                break;

              case DisconnectReason.multideviceMismatch:
                console.log(
                  `${RED}[ERRO] - Mismatch de dispositivos (Versão incorreta).${RESET}`,
                );
                break;

              case DisconnectReason.forbidden:
                console.log(
                  `${RED}[BANIDO/BLOQUEADO] - Acesso negado (403).${RESET}`,
                );
                break;

              default:
                console.log(
                  `${RED}[DESCONHECIDO] - Razão: ${reason}.\nDesconectando por segurança..${RESET}`,
                );
                return;
            }
          }
        },
      );

      client.ev.on("creds.update", saveCreds);

      client.ev.on("chats.upsert", () => {
        console.log(`${YELLOW}Tem conversas...${RESET}`);
      });

      client.ev.on("contacts.upsert", () => {
        console.log(
          `${YELLOW}Tem contatos...${RESET}`,
          // Object.values(store.contacts)
        );
      });

      client.ev.on("creds.update", saveCreds);

      return { client, store };
    } catch (error) {
      throw new Error("Erro ao conectar ao WhatsApp: " + error);
    }
  }
}
