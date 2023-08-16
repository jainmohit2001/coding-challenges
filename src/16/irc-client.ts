import net from 'net';
import { IRCMessage, IRCParser } from './parser';
import { Logger } from 'winston';

interface IRCClientInterface {
  host: string;
  port: number;
  nickName: string;
  realName: string;
  connected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

export default class IRCClient implements IRCClientInterface {
  host;
  port;
  nickName;
  realName;
  connected = false;
  socket: net.Socket;
  debug: boolean = false;
  logger?: Logger;

  constructor(
    host: string,
    port: number,
    nickName: string,
    realName: string,
    debug: boolean = false,
    logger?: Logger
  ) {
    if (nickName.length > 9) {
      throw new Error('Length of nickname should be less than 10');
    }

    this.host = host;
    this.port = port;
    this.nickName = nickName;
    this.realName = realName;
    this.connected = false;
    this.socket = new net.Socket();
    this.debug = debug;
    this.logger = logger;
  }

  async connect(): Promise<void> {
    return new Promise((res, rej) => {
      this.socket.connect(this.port, this.host, () => {});

      this.socket.on('connect', () => {
        let message = `NICK ${this.nickName}\r\n`;
        message += `USER guest 0 * :${this.realName}\r\n`;
        this.write(message);
        this.connected = true;
        res();
      });

      this.socket.on('data', (data) => {
        this.handleDataFromServer(data.toString());
      });

      this.socket.on('error', (error) => {
        if (this.debug && this.logger) {
          this.logger.error(error);
        }
        rej(error);
      });

      this.socket.on('close', () => {
        if (this.debug && this.logger) {
          this.logger.info('Disconnected from server');
        }
        this.connected = false;
      });
    });
  }

  async disconnect(): Promise<void> {
    return new Promise<void>((res) => {
      this.socket.destroy();
      this.socket.on('close', () => {
        res();
      });
    });
  }

  private sendMessage(command: string, params?: string[]) {
    let message = command;

    if (params !== undefined) {
      for (let i = 0; i < params.length; i++) {
        message += ' ' + params[i];
      }
    }

    message;
    if (this.debug && this.logger) {
      this.logger.info('sent ' + message);
    }

    this.socket.write(message + '\r\n');
  }

  private handleDataFromServer(data: string) {
    const messages = data.split('\r\n');
    const parsedMessages: IRCMessage[] = [];

    messages.forEach((str) => {
      if (this.debug && this.logger) {
        this.logger.info('received ' + str);
      }
      if (str.length > 0) {
        const parsedMessage = new IRCParser(str).parse();
        parsedMessages.push(parsedMessage);
      }
    });

    parsedMessages.forEach((message) => {
      switch (message.command) {
        case 'PING':
          this.handlePing(message);
          break;
        case 'NOTICE':
        case '002':
          this.handleWelcomeMessage(message);
      }
    });
  }

  private handlePing(message: IRCMessage) {
    this.sendMessage('PONG', message.params);
  }

  private handleWelcomeMessage(message: IRCMessage) {
    // TODO: Handle welcome messages
  }

  private write(message: string) {
    this.socket.write(message);
  }
}
