import net from 'net';
import { parseMemCommand } from './command';

interface IMemCachedServer {
  /**
   * Port on which the server will start listening to connections.
   *
   * @type {number}
   */
  port: number;

  /**
   * Host on which the server will start listening to connections.
   *
   * @type {string}
   */
  host: string;

  /**
   * Status of the server when starts listening to connections.
   *
   * @type {('listening' | 'closed' | 'error')}
   */
  status: 'listening' | 'closed' | 'error';

  /**
   * Function to start the server.
   *
   * @returns {Promise<void>}
   */
  startServer(): Promise<void>;

  /**
   * Function to stop the server.
   *
   * @returns {Promise<void>}
   */
  stopServer(): Promise<void>;

  /**
   * Return the total number of client connected to the server.
   *
   * @returns {number}
   */
  getConnectedClientsCount(): number;
}

/**
 * The data stored in the Memcached server storage.
 *
 * @interface MemData
 */
interface MemData {
  /**
   * The key of the entry.
   *
   * @type {string}
   */
  key: string;

  /**
   * The value of the entry.
   *
   * @type {string}
   */
  value: string;

  /**
   * Flags passed by the user
   *
   * @type {number}
   */
  flags: number;

  /**
   * Total number of bytes corresponding to value
   *
   * @type {number}
   */
  byteCount: number;

  /**
   * Datetime milliseconds since EPOCH.
   *
   * @type {number}
   */
  addedAt: number;

  /**
   * The expTime in milliseconds
   *
   * @type {number}
   */
  expTime: number;
}

export default class MemCachedServer implements IMemCachedServer {
  port;
  host;
  status: 'listening' | 'closed' | 'error';
  private server: net.Server;
  private storage: Map<string, MemData>;
  private clients: Map<string, net.Socket>;

  constructor(port: number = 11211, host: string = '127.0.0.1') {
    this.port = port;
    this.host = host;
    this.server = new net.Server();
    this.storage = new Map<string, MemData>();
    this.status = 'closed';
    this.clients = new Map<string, net.Socket>();
  }

  getConnectedClientsCount(): number {
    return this.clients.size;
  }

  startServer(): Promise<void> {
    return new Promise<void>((res, rej) => {
      this.server.listen(this.port, this.host, () => {
        this.status = 'listening';
        res();
        console.log('Started listening to connection on port ' + this.port);
      });

      this.server.on('connection', (socket) => {
        const key = `${socket.remoteAddress}:${socket.remotePort}`;

        console.log(`Client connected ${key}`);

        // add client to the map
        this.clients.set(key, socket);

        socket.on('data', (data) => this.handleDataFromClient(socket, data));

        socket.on('close', () => {
          // Remove client from the map
          this.clients.delete(key);
        });
      });

      this.server.on('close', () => {
        this.status = 'closed';
      });
      this.server.on('error', () => {
        this.status = 'error';
        rej();
      });
    });
  }

  stopServer(): Promise<void> {
    return new Promise<void>((res) => {
      this.server.close();

      this.server.on('close', () => {
        res();
      });
    });
  }

  private handleDataFromClient(socket: net.Socket, data: Buffer) {
    const str = data.toString();
    const arr = str.split('\r\n');

    for (let i = 0; i < arr.length; i++) {
      const command = parseMemCommand(arr[i]);
      const name = command.name;

      if (name === 'set' || name === 'add' || name === 'replace') {
        // We need to read the data line by line,
        // since it can be distributed between multiple lines.
        let bytes = command.byteCount!;

        let finalValue = '';

        while (bytes > 0) {
          // Go to next line
          i++;

          // Read the data, CRLF is already removed
          finalValue += arr[i];

          // Decrease the total number of bytes left to read
          bytes -= finalValue.length;
        }

        this.handleSetAddReplaceCommand(
          socket,
          name,
          command.key,
          finalValue,
          command.flags!,
          command.byteCount!,
          command.expTime!,
          command.noReply
        );
      } else if (name === 'get') {
        this.handleGetCommand(socket, command.key);
      }
    }
  }

  private handleSetAddReplaceCommand(
    socket: net.Socket,
    name: 'add' | 'set' | 'replace',
    key: string,
    value: string,
    flags: number,
    byteCount: number,
    expTime: number,
    noreply: boolean = false
  ) {
    console.log(name, key, value, this.storage.has(key));
    // add command: when storage already has a data with the given key
    if (name === 'add' && this.storage.has(key)) {
      if (noreply) {
        return;
      }

      socket.write('NOT_STORED\r\n');
      return;
    }
    // replace command: when storage doesn't have a data with the given key
    else if (name === 'replace' && !this.storage.has(key)) {
      if (noreply) {
        return;
      }

      socket.write('NOT_STORED\r\n');
      return;
    }

    if (expTime >= 0) {
      this.storage.set(key, {
        key,
        value,
        flags,
        byteCount,
        addedAt: new Date().getTime(),
        expTime: expTime * 1000
      });
    }

    if (noreply) {
      return;
    }
    socket.write('STORED\r\n');
  }

  private handleGetCommand(socket: net.Socket, key: string) {
    const obj = this.storage.get(key);
    // Object is not present
    if (obj === undefined) {
      socket.write('END\r\n');
      return;
    }

    // Object is present and expTime is zero
    if (obj.expTime === 0) {
      socket.write(
        `VALUE ${key} ${obj.flags} ${obj.byteCount}\r\n${obj.value}\r\nEND\r\n`
      );
    }

    // Object is present and expTime > 0
    const diff = new Date().getTime() - obj.addedAt;

    // Object is expired
    if (diff >= obj.expTime) {
      socket.write('END\r\n');

      // Lazy delete
      this.storage.delete(key);
      return;
    }

    // Object is not expired
    socket.write(
      `VALUE ${key} ${obj.flags} ${obj.byteCount}\r\n${obj.value}\r\nEND\r\n`
    );
  }
}
