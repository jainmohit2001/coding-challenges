import express from 'express';
import axios from 'axios';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { SchedulingAlgorithm } from './enum';

export interface ILBServer {
  server: Server<typeof IncomingMessage, typeof ServerResponse>;
  algo: SchedulingAlgorithm;
  getServer(): Server<typeof IncomingMessage, typeof ServerResponse>;
  close(): Server<typeof IncomingMessage, typeof ServerResponse>;
}

export class LBServer implements ILBServer {
  private i = 0;
  private port;
  algo: SchedulingAlgorithm;
  private backendServers: string[] = [
    'http://localhost:8080/',
    'http://localhost:8081/'
  ];
  public server: Server<typeof IncomingMessage, typeof ServerResponse>;
  private config = {
    headers: {
      'Content-Type': 'application/json,text/plain'
    }
  };

  constructor(port: number = 80, algo: SchedulingAlgorithm) {
    this.algo = algo;
    this.port = port;
    const totalServers = this.backendServers.length;

    const app = express();

    app.use(express.text());
    app.use(express.json());

    app.get('/', (req, res) => {
      const backendServer = this.getBackendServer();

      this.i = (this.i + 1) % totalServers;

      axios.get(backendServer, this.config).then((backendRes) => {
        console.log(backendRes.data);
        res.status(200).send(backendRes.data);
      });
    });

    const server = app.listen(this.port, () => {
      console.log('LB Server listening on port ' + this.port);
    });

    this.server = server;
  }

  public getServer(): Server<typeof IncomingMessage, typeof ServerResponse> {
    return this.server;
  }

  public close(): Server<typeof IncomingMessage, typeof ServerResponse> {
    return this.server.close();
  }

  private getBackendServer(): string {
    switch (this.algo) {
      case SchedulingAlgorithm.ROUND_ROBIN:
        return this.backendServers[this.i];
    }
  }
}
