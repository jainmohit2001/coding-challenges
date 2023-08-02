import net from 'net';
import { RedisSerializer } from './redis_serializer';
import { RedisCommands } from './redis_commands';
import { RedisDeserializer } from './redis_deserializer';
import { Queue } from '../utils/queue';

interface IRedisClient {
  host: string;
  port: number;
  connect(): void;
  disconnect(): void;
  ping(message?: string): void;
  set(key: string, value: string): void;
  echo(message: string): void;
  get(key: string): Promise<string | null>;
  delete(key: string): Promise<number>;
  setTimeout(timeout: number): void;
}

interface ICommandWaitingForReply {
  resolve(reply?: unknown): void;
  reject(reply?: unknown): void;
}

class CommandWaitingForReply {
  resolve;
  reject;

  constructor(
    resolve: (value: unknown) => void,
    reject: (value: unknown) => void
  ) {
    this.resolve = resolve;
    this.reject = reject;
  }
}

export class RedisClient implements IRedisClient {
  host;
  port;
  private sock?: net.Socket;
  private serializer = new RedisSerializer();
  private commandsQueue: Queue<ICommandWaitingForReply>;

  constructor(host: string = '127.0.0.1', port: number = 6379) {
    this.host = host;
    this.port = port;
    this.commandsQueue = new Queue<ICommandWaitingForReply>(1000);
  }

  setTimeout(timeout: number): void {
    if (this.sock) {
      this.sock.setTimeout(timeout);
    }
  }

  async connect(): Promise<void> {
    this.sock = net.connect(this.port, this.host);

    this.sock.setTimeout(30000);

    this.sock.on('connect', () => {
      console.log('Connected');
    });

    this.sock.on('timeout', () => {
      console.error('Socket timeout');
      this.sock?.end();
    });

    this.sock.on('error', (err) => {
      console.error(err);
      this.sock?.destroy();
    });

    this.sock.on('close', () => {
      console.log('Connection Closed');
    });

    this.sock.on('data', (data) => {
      const dataStr = data.toString();

      const elem = this.commandsQueue.dequeue()!;
      try {
        const ans = new RedisDeserializer(dataStr).parse();
        elem.resolve(ans);
      } catch (err) {
        console.log(err);
        if (err instanceof Error) {
          elem.reject(err.message);
        }
      }
    });
  }

  private async write(data: Array<string>): Promise<unknown> {
    if (this.sock && this.sock.readyState === 'open') {
      const newPromise = new Promise((res, rej) => {
        const elem = new CommandWaitingForReply(res, rej);
        this.commandsQueue.enqueue(elem);
      });
      this.sock.write(this.serializer.serialize(data, true));
      return newPromise;
    }
    throw new Error('Connection is not established');
  }

  async disconnect() {
    this.sock?.destroy();
  }

  async ping(message?: string): Promise<void> {
    const data: string[] = [RedisCommands.PING];
    if (message !== undefined) {
      data.push(message);
    }
    console.log(await this.write(data));
  }

  async set(key: string, value: string): Promise<void> {
    const data: string[] = [RedisCommands.SET, key, value];

    console.log(await this.write(data));
  }

  async echo(message: string): Promise<void> {
    const data: string[] = [RedisCommands.ECHO, message];

    console.log(await this.write(data));
  }

  async get(key: string): Promise<string | null> {
    const data: string[] = [RedisCommands.GET, key];

    const response = await this.write(data);
    if (typeof response === 'string' || response === null) {
      return response;
    }
    if (response instanceof Error) {
      throw response;
    }
    return null;
  }

  async delete(key: string): Promise<number> {
    const data: string[] = [RedisCommands.DEL, key];

    const response = await this.write(data);
    if (typeof response === 'number') {
      return response;
    }
    if (response instanceof Error) {
      throw response;
    }
    throw 0;
  }
}
