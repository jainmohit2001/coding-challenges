import net from 'net';
import { RedisSerializer } from './redis_serializer';
import { RedisCommands } from './redis_commands';
import { RedisDeserializer } from './redis_deserializer';
import { Queue } from '../utils/queue';

interface IRedisClient {
  /**
   * The Redis Server host value.
   *    e.g.: '127.0.0.1'
   *
   * @type {string}
   */
  host: string;

  /**
   * The Redis Server port.
   *    e.g.: 6789
   *
   * @type {number}
   */
  port: number;

  /**
   * This function connects the client to the given host and port.
   * It create a socket and assigns listens to various events such as
   *    'close', 'connect', 'timeout', 'error', and 'data'.
   */
  connect(): void;

  /**
   * This function closes the Socket to the server.
   */
  disconnect(): void;

  /**
   * Sends the PING command to the Redis Server with optional message.
   *
   * @param {?string} [message] - Optional message in PING
   */
  ping(message?: string): void;

  /**
   * Sends the SET command to the Redis server with given key and value
   *
   * @param {string} key
   * @param {string} value
   */
  set(key: string, value: string): void;

  /**
   * Sends the ECHO command to the Redis server with provided message.
   *
   * @param {string} message
   */
  echo(message: string): void;

  /**
   * Sends the GET command to the Redis server.
   * Waits for the server to return the value (if present) otherwise null.
   *
   * @param {string} key
   * @returns {Promise<string | null>}
   */
  get(key: string): Promise<string | null>;

  /**
   * Sends the DEL command to the Server.
   * Waits for the server to respond with a number,
   * representing the elements deleted in the delete operation.
   *
   * @param {string} key
   * @returns {Promise<number>}
   */
  delete(key: string): Promise<number>;

  /**
   * This function sets the timeout for the TCP Socket.
   *
   * @param {number} timeout
   */
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
      // Get the element from the queue.
      try {
        // Deserialize the response and resolve the Promise with the response.
        const ans = new RedisDeserializer(dataStr).parse();
        elem.resolve(ans);
      } catch (err) {
        // If some error occurred in Deserialization, then reject the Promise.
        console.log(err);
        if (err instanceof Error) {
          elem.reject(err.message);
        }
      }
    });
  }

  /**
   * This function creates a Promise on which the client waits till the server responds to the command.
   *
   * @private
   * @async
   * @param {Array<string>} data
   * @returns {Promise<unknown>}
   */
  private async write(data: Array<string>): Promise<unknown> {
    // Check if the Socket connection is open
    if (this.sock && this.sock.readyState === 'open') {
      // Creates a new Promise and appends to the queue.
      // When the data is received from the server,
      // the Promise is resolved or rejects based on the servers' response.
      const newPromise = new Promise((res, rej) => {
        const elem = new CommandWaitingForReply(res, rej);
        this.commandsQueue.enqueue(elem);
      });

      // Write the serialized data in RESP format
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
