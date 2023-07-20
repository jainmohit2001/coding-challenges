import axios from 'axios';
import { BEServerHealth } from './enum';

export interface IBackendServerDetails {
  url: string;
  ping(): Promise<number>;
  setStatus(status: BEServerHealth): void;
  getStatus(): BEServerHealth;
}

export class BackendServerDetails implements IBackendServerDetails {
  url;
  private status: BEServerHealth;
  private pingUrl;
  private controller;

  constructor(
    url: string,
    controller: AbortController,
    status?: BEServerHealth
  ) {
    this.url = url;
    this.controller = controller;
    this.pingUrl = url + 'ping';
    this.status = status ?? BEServerHealth.UNHEALTHY;
  }

  setStatus(status: BEServerHealth): void {
    this.status = status;
  }

  getStatus(): BEServerHealth {
    return this.status;
  }

  async ping(): Promise<number> {
    try {
      const response = await axios.get(this.pingUrl, {
        signal: this.controller.signal
      });
      return response.status;
    } catch (err) {
      return 500;
    }
  }
}
