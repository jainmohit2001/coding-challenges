import net from 'net';
import { parseMemCommand } from './command';

interface IMemCachedServer {
  port: number;
  host: string;
  status: 'listening' | 'closed' | 'error';
  startServer(): Promise<void>;
  stopServer(): Promise<void>;
  getConnectedClientsCount(): number;
}

interface MemData {
  key: string;
  value: string;
  flags: number;
  byteCount: number;
  addedAt: Date;
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

        this.clients.set(key, socket);

        socket.on('data', (data) => this.handleDataFromClient(socket, data));

        socket.on('close', () => {
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
        let bytes = command.byteCount!;

        let finalValue = '';

        while (bytes > 0) {
          i++;
          finalValue += arr[i];
          bytes -= finalValue.length;
        }
        this.handleSetAddReplaceCommand(
          socket,
          name,
          command.key,
          finalValue,
          command.flags!,
          command.byteCount!,
          command.expTime!
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
    expTime: number
  ) {
    // add command: when storage already has a data with the given key
    if (name === 'add' && this.storage.has(key)) {
      socket.write('NOT_STORED\r\n');
      return;
    }
    // replace command: when storage doesn't have a data with the given key
    else if (name === 'replace' && !this.storage.has(key)) {
      socket.write('NOT_STORED\r\n');
      return;
    }

    if (expTime >= 0) {
      this.storage.set(key, {
        key,
        value,
        flags,
        byteCount,
        addedAt: new Date(),
        expTime
      });
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
    const diff = new Date().getSeconds() - obj.addedAt.getSeconds();

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
