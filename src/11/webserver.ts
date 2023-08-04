import net from 'net';
import { HttpRequest, IHttpRequest } from './request';
import { getStatusMessage } from './status_codes';

interface IHttpServer {
  host: string;
  port: number;
  server: net.Server;
  startServer(): void;
  stopServer(): void;
  get(path: string, cb: (request: IHttpRequest) => void): void;
}

export class HttpServer implements IHttpServer {
  host;
  port;
  server;
  private listeners;

  constructor(host: string = '127.0.0.1', port: number = 80) {
    this.host = host;
    this.port = port;
    this.server = new net.Server();
    this.listeners = new Map<string, (request: IHttpRequest) => void>();
  }

  startServer() {
    this.server.listen(this.port, this.host, () => {
      console.log(`Started listening on ${this.host}:${this.port}`);
    });

    this.server.on('connection', (sock) => {
      sock.on('data', (data) => {
        const input = data.toString();

        const request = this.parseRequest(sock, input);

        this.forwardRequestToListener(request);
      });

      sock.on(
        'send',
        (
          request: IHttpRequest,
          responseData: string = '',
          statusCode: number = 200
        ) => {
          const response = this.prepareResponse(
            request,
            responseData,
            statusCode
          );
          sock.write(response);
          sock.end();
          sock.destroy();
        }
      );
    });
  }

  private forwardRequestToListener(request: IHttpRequest) {
    if (this.listeners.has(request.path)) {
      const cb = this.listeners.get(request.path)!;
      cb(request);
      return;
    }
    request.send(undefined, 404);
  }

  get(path: string, cb: (request: IHttpRequest) => void) {
    this.listeners.set(path, cb);
  }

  private prepareResponseHeader(
    request: IHttpRequest,
    statusCode: number = 200
  ): string {
    let str = `${request.httpVersion} ${statusCode} `;
    str += getStatusMessage(statusCode);
    str += '\r\n\r\n';
    return str;
  }

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

  private parseRequestHeaders(elements: string[]): Map<string, string> {
    const headers = new Map<string, string>();
    for (let i = 1; i < elements.length; i++) {
      const elem = elements[i].split(':');
      headers.set(elem[0], elem[1]);
    }
    return headers;
  }

  private parseRequest(sock: net.Socket, data: string): IHttpRequest {
    const line = data.split(/\r\n|\n/)[0];
    const elements = line.split(' ');

    const method = elements[0],
      path = elements[1],
      httpVersion = elements[2];
    const headers = this.parseRequestHeaders(elements);

    return new HttpRequest(sock, method, path, headers, httpVersion);
  }
}
