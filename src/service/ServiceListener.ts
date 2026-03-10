/** @format */

import {
  MessageUpsertType,
  WAMessage,
  WASocket,
} from "@whiskeysockets/baileys";
import { PREFIX } from "../configs/constants";
import {
  getCommand,
  getMessageText,
  getSender,
  getGroupName,
} from "../configs/functions";

/**
 * Serviço para manipulação de eventos.
 */
export class ServiceListener {
  // captura o evento
  private event: object = {};
  // captura todo o Array da Mensagem
  private messages: any[] = [];
  private info: any = {};
  // quem enviou?
  private from: any = "";
  // foi eu quem enviou?
  private fromMe: boolean = false;
  // mensagem marcada
  private quotedMsg: any = {};
  // mensagem completa
  private body: string = "";
  private args: string[] = [];
  // mensagem marcada captura
  private q: string = "";
  // é um comando?
  private isCmd: boolean = false;
  // qual é o comando?
  private command: any | null = null;
  // é um grupo?
  private isGroup: boolean = false;
  // quem enviou a mensagem?
  private sender: string = "";
  // é um bot?
  private isBot: boolean = false;
  // nome de quem enviou a mensagem
  private pushname: any = "";
  // nome do grupo de onde veio a mensagem
  private groupName: any = "";
  // está marcando uma imagem?
  private isQuotedImage: boolean = false;
  // está marcando um audio
  private isQuotedAudio: boolean = false;
  // é uma mensagem especial?
  private isExtendedTextMessage: boolean = false;
  // está marcando algum tipo de mensagem?
  private isQuotedMsg: boolean = false;
  // está marcando uma imagem com legenda?
  private isQuotedMsgWithImg: boolean = false;
  // qual é a mensagem de texto que o User está marcando.
  private messageTextQuoted: string = "";

  constructor(event: {
    messages: WAMessage[];
    type: MessageUpsertType;
    requestId?: string | undefined;
  }) {
    this.event = event;
    this.messages = event.messages || [];
    this.info = this.messages[0];
    this.fromMe = this.info.key?.fromMe;
    this.quotedMsg =
      this.messages[0]?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    this.body = "";
  }

  /**
   * Inicializa o serviço.
   *
   * @param client - O cliente do Baileys.
   * @param store - O store do Baileys.
   */
  public async init(client: WASocket) {
    this.from = this.info.key.senderPn;
    this.body =
      (await getMessageText(this.info.message)) || this.info?.text || "";
    this.args = this.body.trim().split(/ +/).slice(1);
    this.q = this.args.join(" ");
    this.isCmd = this.body.trim().startsWith(PREFIX);
    this.command = await getCommand(this.isCmd, this.body, PREFIX);
    this.isGroup = this.info.key.remoteJidAlt?.endsWith("@g.us") || false;
    this.sender = await getSender(this.isGroup, this.info);
    this.isBot = this.info.key?.fromMe ? true : false;
    this.pushname = this.info.pushName ? this.info.pushName : "";
    this.groupName = await getGroupName(
      this.isGroup,
      async () => await client.groupMetadata(this.from)
    );
    this.isQuotedImage =
      (
        this.info?.message?.extendedTextMessage?.contextInfo?.quotedMessage
          ?.imageMessage
      ) ?
        true
      : false;
    this.isQuotedAudio =
      (
        this.info?.message?.extendedTextMessage?.contextInfo?.quotedMessage
          ?.audioMessage
      ) ?
        true
      : false;
    this.isExtendedTextMessage =
      (
        this.info?.message?.extendedTextMessage?.contextInfo?.quotedMessage
          ?.extendedTextMessage
      ) ?
        true
      : false;
    this.isQuotedMsg =
      (
        this.info?.message?.extendedTextMessage?.contextInfo?.quotedMessage
          ?.conversation
      ) ?
        true
      : false;
    this.isQuotedMsgWithImg =
      (
        this.info?.message?.extendedTextMessage?.contextInfo?.quotedMessage
          ?.imageMessage?.caption
      ) ?
        true
      : false;
    this.messageTextQuoted =
      this.info?.message?.extendedTextMessage?.contextInfo?.quotedMessage
        ?.conversation || "";
  }

  //getters

  public get getMessages(): any[] {
    return this.messages;
  }

  public get getEvent(): any {
    return this.event;
  }

  public get getEessages(): any[] {
    return this.messages;
  }

  public get getInfo(): any {
    return this.info;
  }

  public get getFrom(): string {
    return this.from;
  }

  public get getFromMe(): boolean {
    return this.fromMe;
  }

  public get getQuotedMsg(): any {
    return this.quotedMsg;
  }

  public get getBody(): any {
    return this.body;
  }

  public get getArgs(): string[] {
    return this.args;
  }

  public get getSplitMsg(): string {
    return this.q;
  }

  public get getIsCmd(): boolean {
    return this.isCmd;
  }

  public get getCommand(): any | null {
    return this.command;
  }

  public get getIsGroup(): boolean {
    return this.isGroup;
  }

  public get getSender(): string {
    return this.sender;
  }

  public get getIsBot(): boolean {
    return this.isBot;
  }

  public get getIsQuotedImage(): boolean {
    return this.isQuotedImage;
  }

  public get getIsQuotedAudio(): boolean {
    return this.isQuotedAudio;
  }

  public get getIsExtendedTextMessage(): boolean {
    return this.isExtendedTextMessage;
  }

  public get getIsQuotedMsg(): boolean {
    return this.isQuotedMsg;
  }

  public get getIsQuotedMsgWithImg(): boolean {
    return this.isQuotedMsgWithImg;
  }

  public get getMessageTextQuoted(): string {
    return this.messageTextQuoted;
  }

  public get getPushname(): string {
    return this.pushname;
  }

  public get getGroupName(): string {
    return this.groupName;
  }
}
