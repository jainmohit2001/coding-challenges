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

      if (this.debug) {
        console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
      }

      sock.on('error', (err) => {
        console.error(err.message);
        sock.end();
      });

      sock.on('close', () => {
        this.sockets.delete(sock.remoteAddress + ':' + sock.remotePort);
      });

      sock.on('data', (data) => {
        const dataStr = data.toString();
        const dataLength = dataStr.length;

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
        let currentPos = 0;

        while (currentPos < dataLength) {
          try {
            const deserializer = new RedisDeserializer(
              dataStr.substring(currentPos),
              true
            );
            const serializedData = deserializer.parse() as Array<string>;
            currentPos += deserializer.getPos();
            this.handleRequests(sock, serializedData);
          } catch (e) {
            if (this.debug) {
              console.error(e);
            }
            sock.emit('sendResponse', new Error('Cannot parse'));
            break;
          }
        }
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
        case RedisCommands.DEL:
          this.handleDelete(sock, data);
          break;
        default:
          throw new Error(`UNKNOWN_COMMAND: ${command}`);
      }
    } catch (e) {
      if (e instanceof Error && this.debug) {
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

  private handleDelete(sock: net.Socket, data: Array<string>) {
    const key = data[1];
    const response = this.map.delete(key) ? 1 : 0;
    sock.emit('sendResponse', response);
  }

  stopServer(): Promise<void> {
    return new Promise<void>((res) => {
      this.sockets.forEach((sock) => {
        sock.destroy();
      });

      this.server?.close();

      this.server.on('close', () => {
        if (this.debug) {
          console.log('Redis server stopped listening on port ' + this.port);
        }
        res();
      });
    });
  }
}
