import express from 'express';
import { IncomingMessage, Server, ServerResponse } from 'http';

export interface IBackendServer {
  port: number;
  responseString: string;
  server: Server<typeof IncomingMessage, typeof ServerResponse>;
  getServer(): Server<typeof IncomingMessage, typeof ServerResponse>;
  close(): Server<typeof IncomingMessage, typeof ServerResponse>;
}

export class BackendServer implements IBackendServer {
  port;
  responseString;
  server;

  constructor(port: number) {
    this.port = port;
    this.responseString = 'Hello from backend Server with port ' + this.port;

    const app = express();

    app.use(express.text());
    app.use(express.json());

    app.get('/ping', (req, res) => {
      res.sendStatus(200);
    });

    app.get('/', (req, res) => {
      res.status(200).send(this.responseString);
    });

    const server = app.listen(port, () => {
      console.log('Backend Server listening on port ' + this.port);
    });

    this.server = server;
  }

  public getServer(): Server<typeof IncomingMessage, typeof ServerResponse> {
    return this.server;
  }

  public close() {
    const server = this.server.close();
    console.log(`Closed Backend Server with port ${this.port}`);
    return server;
  }
}
