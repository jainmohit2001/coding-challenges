import net from 'net';
import { RedisSerializer } from './redis_serializer';
import { RedisDeserializer } from './redis_deserializer';
import { RedisCommands } from './redis_commands';
import { RespType } from './types';

interface IRedisServer {
  host: string;
  port: number;
  debug: boolean;
  startServer(): void;
  stopServer(): Promise<void>;
}

export class RedisServer implements IRedisServer {
  host;
  port;
  debug;
  private server: net.Server;
  private serializer: RedisSerializer;
  private map: Map<string, RespType>;
  private sockets: Map<string, net.Socket>;

  constructor(
    port: number = 6379,
    host: string = '127.0.0.1',
    debug: boolean = false
  ) {
    this.host = host;
    this.port = port;
    this.debug = debug;
    this.serializer = new RedisSerializer();
    this.map = new Map<string, string>();
    this.server = new net.Server();
    this.sockets = new Map<string, net.Socket>();
  }

  startServer() {
    this.server.listen(this.port, this.host, () => {
      if (this.debug) {
        console.log('Redis server started listening on port: ' + this.port);
      }
    });

    this.server.on('connection', (sock) => {
      this.sockets.set(sock.remoteAddress + ':' + sock.remotePort, sock);
      console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

      sock.on('error', (err) => {
        console.error(err.message);
        sock.end();
      });

      sock.on('close', () => {
        console.log('CLOSED: ' + sock.remoteAddress + ':' + sock.remotePort);
        this.sockets.delete(sock.remoteAddress + ':' + sock.remotePort);
      });

      sock.on('data', (data) => {
        const dataStr = data.toString();
        if (this.debug) {
          console.log(
            'DATA ' +
              sock.remoteAddress +
              ':' +
              sock.remotePort +
              ' :' +
              JSON.stringify(dataStr)
          );
        }

        const serializedData = new RedisDeserializer(
          dataStr
        ).parse() as Array<string>;

        this.handleRequests(sock, serializedData);
      });

      sock.addListener('sendResponse', (data: RespType) => {
        const str = this.serializer.serialize(data, true);
        sock.write(str);
      });
    });
  }

  private handleRequests(sock: net.Socket, data: Array<string>) {
    try {
      const command = data[0];
      switch (command) {
        case RedisCommands.PING:
          this.handlePing(sock, data);
          break;
        case RedisCommands.ECHO:
          this.handleEcho(sock, data);
          break;
        case RedisCommands.SET:
          this.handleSet(sock, data);
          break;
        case RedisCommands.GET:
          this.handleGet(sock, data);
          break;
        default:
          throw new Error(`UNKNOWN_COMMAND: ${command}`);
      }
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
    }
  }

  private handlePing(sock: net.Socket, data: Array<string>) {
    if (data === null) {
      throw new Error('PING: Invalid data');
    }
    let response = 'PONG';
    const message = data[1];
    if (message !== undefined) {
      response = message;
    }
    sock.emit('sendResponse', response);
  }

  private handleEcho(sock: net.Socket, data: Array<string>) {
    sock.emit('sendResponse', data[1]);
  }

  private handleSet(sock: net.Socket, data: Array<string>) {
    const key = data[1];
    const value = data[2];
    this.map.set(key, value);
    sock.emit('sendResponse', 'OK');
  }

  private handleGet(sock: net.Socket, data: Array<string>) {
    const key = data[1];
    const response = this.map.get(key) ?? null;
    if (typeof response !== 'string') {
      throw new Error(`INVALID type of value ${typeof response}`);
    }
    sock.emit('sendResponse', response);
  }

  stopServer(): Promise<void> {
    return new Promise<void>((res) => {
      this.sockets.forEach((sock) => {
        sock.destroy();
      });

      this.server?.close();

      this.server.on('close', () => {
        console.log('Redis server stopped listening on port ' + this.port);
        res();
      });
    });
  }
}
