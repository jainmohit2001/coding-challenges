import express from 'express';
import axios from 'axios';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { BEServerHealth, SchedulingAlgorithm } from './enum';
import { BackendServerDetails, IBackendServerDetails } from './be_details';

export interface ILBServer {
  server: Server<typeof IncomingMessage, typeof ServerResponse>;
  algo: SchedulingAlgorithm;
  backendServers: IBackendServerDetails[];
  healthCheckPeriodInSeconds: number;
  getServer(): Server<typeof IncomingMessage, typeof ServerResponse>;
  close(): Server<typeof IncomingMessage, typeof ServerResponse>;
  startHealthCheck(): void;
  stopHealthCheck(): void;
  performHealthCheck(): Promise<void>;
}

export class LBServer implements ILBServer {
  private i = 0;
  private port;
  algo;
  private backendServerUrls = [
    'http://localhost:8080/',
    'http://localhost:8081/',
    'http://localhost:8082/'
  ];
  server;
  backendServers;
  healthCheckPeriodInSeconds;
  private healthCheckTimer!: NodeJS.Timer;
  private healthyServers: Array<IBackendServerDetails>;
  private controller;

  constructor(
    port: number = 80,
    algo: SchedulingAlgorithm,
    healthCheckPeriodInSeconds: number
  ) {
    this.healthyServers = new Array<BackendServerDetails>();
    this.backendServers = new Array<BackendServerDetails>();
    this.controller = new AbortController();
    this.healthCheckPeriodInSeconds = healthCheckPeriodInSeconds;
    this.backendServerUrls.forEach((url) => {
      const beServer = new BackendServerDetails(url, this.controller);
      this.backendServers.push(beServer);
    });
    this.algo = algo;
    this.port = port;

    const app = express();

    app.use(express.text());
    app.use(express.json());

    app.get('/', async (req, res) => {
      const backendServer = this.getBackendServer();
      if (this.healthyServers.length === 0) {
        res.sendStatus(500);
      } else {
        this.i = (this.i + 1) % this.healthyServers.length;
        try {
          const response = await axios.get(backendServer.url);
          backendServer.incrementCount();
          res.status(200).send(response.data);
        } catch (err) {
          console.error(err);
          res.sendStatus(500);
        }
      }
    });

    this.server = app.listen(this.port, () => {
      console.log('LB Server listening on port ' + this.port);
    });
    this.startHealthCheck();
  }

  public getServer(): Server<typeof IncomingMessage, typeof ServerResponse> {
    return this.server;
  }

  public close(): Server<typeof IncomingMessage, typeof ServerResponse> {
    this.stopHealthCheck();
    this.controller.abort();
    const server = this.server.close();
    console.log('Closed LB Server');
    this.printBackendStats();
    return server;
  }

  private getBackendServer(): IBackendServerDetails {
    switch (this.algo) {
      case SchedulingAlgorithm.ROUND_ROBIN:
        return this.healthyServers[this.i % this.healthyServers.length];
    }
  }

  public startHealthCheck(): void {
    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthCheck();
    }, this.healthCheckPeriodInSeconds * 1000);
  }

  public async performHealthCheck(): Promise<void> {
    const tasks = [];
    for (let i = 0; i < this.backendServers.length; i++) {
      tasks.push(this.backendServers[i].ping());
    }
    await Promise.all(tasks).then((values) => {
      for (let i = 0; i < values.length; i++) {
        const oldStatus = this.backendServers[i].getStatus();
        if (values[i] === 200) {
          if (oldStatus !== BEServerHealth.HEALTHY) {
            this.backendServers[i].setStatus(BEServerHealth.HEALTHY);
          }
          if (
            this.healthyServers
              .map((server) => server.url)
              .indexOf(this.backendServers[i].url) < 0
          ) {
            this.backendServers[i].resetCount();
            this.healthyServers.push(this.backendServers[i]);
          }
        } else {
          if (oldStatus !== BEServerHealth.UNHEALTHY) {
            this.backendServers[i].setStatus(BEServerHealth.UNHEALTHY);
          }
          const index = this.healthyServers
            .map((server) => server.url)
            .indexOf(this.backendServers[i].url);
          if (index >= 0) {
            this.healthyServers.splice(index, 1);
          }
        }
      }
    });
    console.log(
      `Completed Health Check. Total backend servers online: ${this.healthyServers.length}`
    );
  }

  public stopHealthCheck(): void {
    clearInterval(this.healthCheckTimer);
  }

  private printBackendStats(): void {
    const status: [string, number, string][] = [];
    this.backendServers.forEach((server) => {
      status.push([
        server.url,
        server.count,
        BEServerHealth[server.getStatus()]
      ]);
    });
    console.log(status);
  }
}
