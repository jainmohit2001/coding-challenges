import net from 'net';
import fs from 'fs';

interface IHttpRequest {
  method: string;
  path: string;
  headers: Map<string, string>;
  httpVersion: string;
  send(data?: string): void;
  send(data?: string, statusCode?: number): void;
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
