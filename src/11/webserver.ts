import net from 'net';
import { HttpRequest, IHttpRequest } from './request';
import { getStatusMessage } from './status_codes';

interface IHttpServer {
  /**
   * Represents the host of the net.Server
   *
   * @type {string}
   */
  host: string;

  /**
   * Represents the port of the net.Server
   *
   * @type {number}
   */
  port: number;

  /**
   * The net.Server instance
   *
   * @type {net.Server}
   */
  server: net.Server;

  /**
   * Starts listening on the given host and port.
   */
  startServer(): void;

  /**
   * Stops the net.Server instance.
   */
  stopServer(): void;

  /**
   * This method is exposed to the user for adding GET routes with the callback function. The callback function is executed
   *
   * @param {string} path
   * @param {(request: IHttpRequest) => void} cb
   */
  get(path: string, cb: (request: IHttpRequest) => void): void;
}

export class HttpServer implements IHttpServer {
  host;
  port;
  server;
  private debug = false;
  private listeners;

  constructor(
    host: string = '127.0.0.1',
    port: number = 80,
    debug: boolean = false
  ) {
    this.host = host;
    this.port = port;
    this.server = new net.Server();
    this.listeners = new Map<string, (request: IHttpRequest) => void>();
    this.debug = debug;
  }

  startServer() {
    if (this.server.listening) {
      return;
    }
    this.server.listen(this.port, this.host, () => {
      console.log(`Started listening on ${this.host}:${this.port}`);
    });

    this.server.on('connection', (sock) => {
      sock.on('data', (data) => {
        const input = data.toString();

        const request = this.parseRequest(sock, input);

        this.forwardRequestToListener(request);
      });

      // This event is called when the server responds to a given request.
      sock.on(
        'send',
        (
          request: IHttpRequest,
          responseData: string = '',
          statusCode: number = 200
        ) => {
          // Prepare the response
          const response = this.prepareResponse(
            request,
            responseData,
            statusCode
          );

          if (this.debug) {
            console.log(
              `${request.method} ${request.path} ${request.httpVersion} ${statusCode}`
            );
          }

          // Write the response and close the socket
          sock.write(response);
          sock.end();
          sock.destroy();
        }
      );
    });
  }

  /**
   * This function forwards the incoming request to relevant listener.
   * If no listener is found, then the server return with status code 404.
   * If the CB raises an error, the server will respond with status code 500.
   *
   * @private
   * @param {IHttpRequest} request
   */
  private async forwardRequestToListener(request: IHttpRequest) {
    const key = `${request.method.toUpperCase()} ${request.path}`;

    if (this.listeners.has(key)) {
      try {
        const cb = this.listeners.get(key)!;
        await cb(request);
      } catch (e) {
        if (this.debug) {
          console.error(e);
        }
        request.send(undefined, 500);
      }
      return;
    }

    request.send(undefined, 404);
  }

  /**
   * Register the Call back function for GET requests on given path.
   *
   * @param {string} path
   * @param {(request: IHttpRequest) => void} cb
   */
  get(path: string, cb: (request: IHttpRequest) => void): void {
    this.listeners.set('GET ' + path, cb);
  }

  /**
   * Prepare the response headers from the request and given status.
   *
   * @private
   * @param {IHttpRequest} request
   * @param {number} [statusCode=200]
   * @returns {string}
   */
  private prepareResponseHeader(
    request: IHttpRequest,
    statusCode: number = 200
  ): string {
    let str = `${request.httpVersion} ${statusCode} `;
    str += getStatusMessage(statusCode);
    str += '\r\n\r\n';
    return str;
  }

  /**
   * Prepare the response string for a given request
   *
   * @private
   * @param {IHttpRequest} request
   * @param {string} [responseData='']
   * @param {number} [statusCode=200]
   * @returns {string}
   */
  private prepareResponse(
    request: IHttpRequest,
    responseData: string = '',
    statusCode: number = 200
  ): string {
    const headers = this.prepareResponseHeader(request, statusCode);
    return `${headers}${responseData}\r\n`;
  }

  stopServer() {
    this.server.close();
  }

  /**
   * Given a list of strings representing the lines in a data,
   * this function populates the header for the request.
   *
   * @private
   * @param {string[]} elements
   * @returns {Map<string, string>}
   */
  private parseRequestHeaders(elements: string[]): Map<string, string> {
    const headers = new Map<string, string>();
    for (let i = 1; i < elements.length; i++) {
      const elem = elements[i].split(':');
      headers.set(elem[0], elem[1]);
    }
    return headers;
  }

  /**
   * Given the request data, this function splits the data into lines.
   * It then creates the request headers from lines.
   * Finally returns the HttpRequest object.
   *
   * @private
   * @param {net.Socket} sock
   * @param {string} data
   * @returns {IHttpRequest}
   */
  private parseRequest(sock: net.Socket, data: string): IHttpRequest {
    const lines = data.split(/\r\n|\n/);
    const elements = lines[0].split(' ');

    const method = elements[0],
      path = elements[1],
      httpVersion = elements[2];
    const headers = this.parseRequestHeaders(lines);

    return new HttpRequest(sock, method, path, headers, httpVersion);
  }
}
