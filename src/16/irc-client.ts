import net from 'net';
import { IRCParser } from './parser';

interface IRCClientInterface {
  host: string;
  port: number;
  nickName: string;
  realName: string;
  connected: boolean;
  connect(): Promise<void>;
  disconnect(): void;
}

export default class IRCClient implements IRCClientInterface {
  host;
  port;
  nickName;
  realName;
  connected = false;
  socket: net.Socket;

  constructor(host: string, port: number, nickName: string, realName: string) {
    if (nickName.length > 9) {
      throw new Error('Length of nickname should be less than 10');
    }

    this.host = host;
    this.port = port;
    this.nickName = nickName;
    this.realName = realName;
    this.connected = false;
    this.socket = new net.Socket();
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
        rej(error);
      });

      this.socket.on('close', () => {
        this.connected = false;
      });
    });
  }

  disconnect(): void {
    this.socket.destroy();
  }

  private handleDataFromServer(data: string) {
    const messages = data.split('\r\n');

    messages.forEach((str) => {
      if (str.length > 0) {
        const parsedMessage = new IRCParser(str).parse();
      }
    });
    console.log(data);
  }

  private write(message: string) {
    this.socket.write(message);
  }
}
