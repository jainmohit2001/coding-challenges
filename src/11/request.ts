import net from 'net';
import fs from 'fs';

interface IHttpRequest {
  /**
   * Represents the type of HTTP request.
   *    Possible values - GET, POST, DELETE, PUT, PATCH
   *
   * @type {string}
   */
  method: string;

  /**
   * The path for the HTTP request
   *
   * @type {string}
   */
  path: string;

  /**
   * Headers for the HTTP request
   *
   * @type {Map<string, string>}
   */
  headers: Map<string, string>;

  /**
   * Http Version for the request.
   *
   * @type {string}
   */
  httpVersion: string;

  /**
   * Send the response for the request.
   * Multiple overrides for this function.
   *
   * @param {?string} [data]
   */
  send(data?: string): void;
  send(data?: string, statusCode?: number): void;

  /**
   * Send a file to the client for the request.
   * Can be used for serving HTML files
   *
   * @param {string} path
   */
  sendFile(path: string): void;
}

class HttpRequest implements IHttpRequest {
  private sock: net.Socket;
  method;
  path;
  headers;
  httpVersion;

  constructor(
    sock: net.Socket,
    method: string,
    path: string,
    headers: Map<string, string> = new Map<string, string>(),
    httpVersion: string
  ) {
    this.sock = sock;
    this.method = method;
    this.path = path;
    this.headers = headers;
    this.httpVersion = httpVersion;
  }

  send(data = '', statusCode = 200) {
    this.sock.emit('send', this, data, statusCode);
  }

  sendFile(path: string) {
    if (fs.existsSync(path)) {
      this.sock.emit('send', this, fs.readFileSync(path).toString(), 200);
      return;
    }

    this.sock.emit('send', this, undefined, 404);
    throw new Error('File does not exists: ' + path);
  }
}

export { IHttpRequest, HttpRequest };
