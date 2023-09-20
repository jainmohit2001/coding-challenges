import net from 'net';
import { Kind, Msg, Parser } from './parser';

interface Client {
  socket: net.Socket;
  parser: Parser;
}

export default class NATSServer {
  private port: number;
  private host: string;
  server: net.Server;
  private clients: Map<string, Client>;

  constructor(port: number, host: string = '0.0.0.0') {
    this.port = port;
    this.host = host;
    this.server = new net.Server();
    this.clients = new Map<string, Client>();
  }

  startServer(): void {
    this.server.listen(this.port, this.host, () => {
      console.log(`Started listening on port ${this.port}`);
    });

    this.server.on('connection', (socket) => {
      const key = `${socket.remoteAddress}:${socket.remotePort}`;

      const cb = (msg: Msg) => {
        this.handleMessage(msg, socket);
      };

      const parser = new Parser(cb);
      this.clients.set(key, { socket, parser });

      socket.on('close', () => {
        this.clients.delete(key);
      });

      socket.on('data', (data) => {
        try {
          parser.parse(data);
        } catch (e) {
          console.error(e);
        }
      });

      this.sendInfo(socket);
    });

    this;
  }

  private handleMessage(msg: Msg, socket: net.Socket) {
    switch (msg.kind) {
      case Kind.PING:
        this.sendPong(socket);
        break;
      case Kind.CONNECT:
        this.sendOk(socket);
        break;
    }
  }

  private sendPong(socket: net.Socket) {
    socket.write('PONG\r\n');
  }

  private sendOk(socket: net.Socket) {
    socket.write('+OK\r\n');
  }

  private sendInfo(socket: net.Socket) {
    const data = {
      host: this.host,
      port: this.port,
      client_ip: socket.remoteAddress
    };

    const info = JSON.stringify(data);

    socket.write(`INFO ${info}\r\n`);
  }

  async stopServer(): Promise<void> {
    return new Promise<void>((res, rej) => {
      this.server.close((err) => {
        if (err) {
          rej(err);
          return;
        }
        res();
      });
    });
  }
}
