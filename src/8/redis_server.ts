import express, { Request, Response } from 'express';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { RedisSerializer } from './redis_serializer';
import { RedisDeserializer } from './redis_deserializer';
import { RedisCommands } from './redis_commands';
import { RespType } from './types';

interface IRedisServer {
  port: number;
  debug: boolean;
  startServer(): void;
  stopServer(): void;
}

export class RedisServer implements IRedisServer {
  port;
  debug;
  private server?: Server<typeof IncomingMessage, typeof ServerResponse>;
  private serializer: RedisSerializer;
  private map: Map<string, RespType>;

  constructor(port: number = 6379, debug: boolean = false) {
    this.port = port;
    this.debug = debug;
    this.serializer = new RedisSerializer();
    this.map = new Map<string, string>();
  }

  startServer() {
    const app = express();

    app.use(express.text());
    const serializer = this.serializer;

    app.use(function (req, res, next) {
      const send = res.send;
      req.body = new RedisDeserializer(req.body).parse();
      res.send = function (body) {
        body = serializer.serialize(body);
        send.call(this, body);
        return res;
      };
      next();
    });

    // Starts listening on given port
    this.server = app.listen(this.port, () => {
      console.log('Redis server started on ' + this.port);
    });

    app.post('/', (req, res) => this.handleRequests(req, res));
  }

  private handleRequests(req: Request, res: Response) {
    const data = req.body;
    const clientAddress = req.socket.remoteAddress;
    if (this.debug) {
      console.debug('DATA ' + clientAddress + ': ' + JSON.stringify(data));
    }
    try {
      const command = data[0];
      switch (command) {
        case RedisCommands.PING:
          this.handlePing(res, data);
          break;
        case RedisCommands.ECHO:
          this.handleEcho(res, data);
          break;
        case RedisCommands.SET:
          this.handleSet(res, data);
          break;
        case RedisCommands.GET:
          this.handleGet(res, data);
          break;
        default:
          throw new Error(`UNKNOWN_COMMAND: ${command}`);
      }
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
        res.send(e);
      }
    }
  }

  private handlePing(res: Response, data: Array<string>) {
    if (data === null) {
      throw new Error('PING: Invalid data');
    }
    let response = 'PONG';
    const message = data[1];
    if (message !== undefined) {
      response = message;
    }
    res.send(response);
  }

  private handleEcho(res: Response, data: Array<string>) {
    res.send(data[1]);
  }

  private handleSet(res: Response, data: Array<string>) {
    const key = data[1];
    const value = data[2];
    this.map.set(key, value);
    res.send('OK');
  }

  private handleGet(res: Response, data: Array<string>) {
    const key = data[1];
    const response = this.map.get(key) ?? null;
    if (typeof response !== 'string') {
      throw new Error(`INVALID type of value ${typeof response}`);
    }
    res.send(response);
  }

  stopServer() {
    this.server?.close();
    console.log('Redis server stopped listening on port ' + this.port);
  }
}
