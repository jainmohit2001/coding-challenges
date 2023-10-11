import Client from 'ioredis';
import { RateLimiter, RedisSlidingWindowCounterArgs } from '../types';
import { Request, Response, NextFunction } from 'express';
import Redlock from 'redlock';

export type Counter = {
  /**
   * Stores the counter corresponding to previous Window.
   *
   * @type {number}
   */
  prevCounter: number;

  /**
   * Stores the timestamp of the previous Window in ms.
   *
   * @type {number}
   */
  prevWindow: number;

  /**
   * Stores the counter corresponding to current Window.
   *
   * @type {number}
   */
  currentCounter: number;

  /**
   * Stores the timestamp of the current Window in ms.
   *
   * @type {number}
   */
  currentWindow: number;
};

export class RedisSlidingWindowCounterRateLimiter implements RateLimiter {
  threshold: number;

  client: Client.Redis;

  redlock: Redlock;

  constructor({ threshold, client, redlock }: RedisSlidingWindowCounterArgs) {
    this.threshold = threshold;
    this.client = client;
    this.redlock = redlock;
  }

  async handleRequest(req: Request, res: Response, next: NextFunction) {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Make sure a valid IP is present in the request.
    if (typeof ip !== 'string') {
      res
        .status(400)
        .send('Invalid x-forwarded-for header or remote address\n');
      return;
    }

    ip = ip.replaceAll(/:|\./g, '');

    const lock = await this.redlock.acquire(ip + 'redlock', 5000);

    const value = await this.client.get(ip);
    const counter = value !== null ? (JSON.parse(value) as Counter) : null;
    const requestTimestamp = new Date().getTime();

    const currentWindow = Math.floor(new Date().getTime() / 1000) * 1000;
    const prevWindow = currentWindow - 1000;

    // If this is the first request from the given IP
    if (counter === null) {
      await this.client.set(
        ip,
        JSON.stringify({
          currentCounter: 1,
          currentWindow: currentWindow,
          prevCounter: 0,
          prevWindow: prevWindow
        })
      );

      await lock.unlock();

      next();
      return;
    }

    // Update counters and windows
    if (currentWindow != counter.currentWindow) {
      if (counter.currentWindow === prevWindow) {
        counter.prevCounter = counter.currentCounter;
        counter.prevWindow = counter.currentWindow;
      } else {
        counter.prevCounter = 0;
        counter.prevWindow = prevWindow;
      }
      counter.currentWindow = currentWindow;
      counter.currentCounter = 0;
    }

    const currentWindowWeight = (requestTimestamp - currentWindow) / 1000;

    const prevWindowWeight = 1 - currentWindowWeight;

    const count =
      counter.currentCounter * currentWindowWeight +
      counter.prevCounter * prevWindowWeight;

    // If the count is higher than the threshold, then reject the request
    if (count >= this.threshold) {
      // Update the counters for this IP
      await this.client.set(ip, JSON.stringify(counter));

      await lock.unlock();

      res.status(429).send('Too many requests. Please try again later\n');
      return;
    }

    // update the current counter for this IP
    counter.currentCounter++;
    await this.client.set(ip, JSON.stringify(counter));

    await lock.unlock();

    next();
  }

  cleanup(): void {}
}
