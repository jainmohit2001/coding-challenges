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

  /**
   * Returns the HTTP Server corresponding to the Express app.
   *
   * @returns {Server<typeof IncomingMessage, typeof ServerResponse>}
   */
  getServer(): Server<typeof IncomingMessage, typeof ServerResponse>;

  /**
   * Closes the express server and returns with the server object.
   *
   * @returns {Server<typeof IncomingMessage, typeof ServerResponse>}
   */
  close(): Server<typeof IncomingMessage, typeof ServerResponse>;

  /**
   * Start a separate asynchronous health check.
   */
  startHealthCheck(): void;

  /**
   * Stops the Health check
   */
  stopHealthCheck(): void;

  /**
   * This function performs the health check for all BE servers.
   *
   * @returns {Promise<void>}
   */
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
    // Initialize parameters
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

    // Attach parsers
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
    try {
      this.server = app.listen(this.port, () => {
        console.log('LB Server listening on port ' + this.port);
      });
    } catch (err) {
      console.error(err);
      this.port = 4000;
      this.server = app.listen(this.port, () => {
        console.log('LB Server listening on port ' + this.port);
      });
    }

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

  /**
   * This is the scheduling function that returns the Backend Server details
   * based on the scheduling algorithm for sending incoming requests.
   *
   * @private
   * @returns {IBackendServerDetails}
   */
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
    // Create Tasks for async operations
    const tasks = [];
    for (let i = 0; i < this.backendServers.length; i++) {
      tasks.push(this.backendServers[i].ping());
    }

    // Wait for tasks to complete
    await Promise.all(tasks).then((values) => {
      for (let i = 0; i < values.length; i++) {
        const oldStatus = this.backendServers[i].getStatus();

        // If BE Server is live
        if (values[i] === 200) {
          // Update  BE Server status if required
          if (oldStatus !== BEServerHealth.HEALTHY) {
            this.backendServers[i].setStatus(BEServerHealth.HEALTHY);
          }
          // Add to the list of healthy servers if required
          if (
            this.healthyServers
              .map((server) => server.url)
              .indexOf(this.backendServers[i].url) < 0
          ) {
            this.backendServers[i].resetCount();
            this.healthyServers.push(this.backendServers[i]);
          }
        } else {
          // Update  BE Server status if required
          if (oldStatus !== BEServerHealth.UNHEALTHY) {
            this.backendServers[i].setStatus(BEServerHealth.UNHEALTHY);
          }
          // Remove from the list of healthy servers if present
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

  /**
   * Log the details corresponding to BE Servers.
   *
   * @private
   */
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
