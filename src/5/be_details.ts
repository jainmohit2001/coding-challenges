import axios from 'axios';
import { BEServerHealth } from './enum';

export interface IBackendServerDetails {
  url: string;
  count: number;

  /**
   * Reset the number of requests sent to this server
   */
  resetCount(): void;

  /**
   * Performs a simple GET operation on the PING URL.
   * Expected Status code is 200 if Backend Server is live.
   *
   * @public
   * @async
   * @returns {Promise<number>} - Status code of the PING request
   */
  ping(): Promise<number>;

  setStatus(status: BEServerHealth): void;

  getStatus(): BEServerHealth;

  /**
   * Increments the total requests sent to this server
   *
   * @public
   * @returns {number} - The number of requests sent after increment
   */
  incrementCount(): number;
}

export class BackendServerDetails implements IBackendServerDetails {
  url;
  private status: BEServerHealth;
  private pingUrl;
  private controller;
  count;

  constructor(
    url: string,
    controller: AbortController,
    status?: BEServerHealth
  ) {
    this.url = url;
    this.count = 0;
    this.controller = controller;
    this.pingUrl = url + 'ping';
    this.status = status ?? BEServerHealth.UNHEALTHY;
  }

  public setStatus(status: BEServerHealth): void {
    this.status = status;
  }

  public getStatus(): BEServerHealth {
    return this.status;
  }

  public async ping(): Promise<number> {
    try {
      const response = await axios.get(this.pingUrl, {
        signal: this.controller.signal
      });
      return response.status;
    } catch (err) {
      return 500;
    }
  }

  public resetCount() {
    this.count = 0;
  }

  public incrementCount(): number {
    this.count++;
    return this.count;
  }
}
