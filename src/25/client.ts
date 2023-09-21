import net from 'net';

/**
 * This class stores the information regarding a connected Client.
 *
 * @export
 * @class Client
 */
export class Client {
  /**
   * This key is used to uniquely identify the client inside the server.
   *
   * @type {string}
   */
  key: string;

  /**
   * The socket instance corresponding to the connection.
   *
   * @type {net.Socket}
   */
  socket: net.Socket;
  private options: ClientOptions;

  constructor(
    key: string,
    socket: net.Socket,
    options: ClientOptions = DEFAULT_OPTIONS
  ) {
    this.key = key;
    this.socket = socket;
    this.options = options;
  }

  updateOptions(data: Partial<ClientOptions>) {
    this.options = { ...this.options, ...data };
  }

  sendPong() {
    this.socket.write('PONG\r\n');
  }

  /**
   * Send a +OK message if the client option has verbose set to true.
   */
  sendOk() {
    if (this.options.verbose) {
      this.socket.write('+OK\r\n');
    }
  }
}

/**
 * Refer to https://docs.nats.io/reference/reference-protocols/nats-protocol#connect
 *
 * @export
 * @interface ClientOptions
 */
export interface ClientOptions {
  verbose: boolean;
  pedantic: boolean;
  tls_required: boolean;
  auth_token?: string;
  user?: string;
  pass?: string;
  name?: string;
  lang: string;
  version: string;
  protocol?: number;
  echo?: boolean;
  sig?: string;
  jwt?: string;
  no_responders?: boolean;
  headers?: boolean;
  nkey?: string;
}

export const DEFAULT_OPTIONS: ClientOptions = {
  verbose: true,
  pedantic: true,
  tls_required: false,
  lang: '',
  version: ''
};
