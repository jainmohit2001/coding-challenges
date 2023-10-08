import { NextFunction, Request, Response } from 'express';
import { FixedWindowCounterArgs, RateLimiter } from '../types';

interface Counter {
  /**
   * The start of the window.
   *
   * @type {number}
   */
  window: number;

  /**
   * Number of requests received so far in the current window.
   *
   * @type {number}
   */
  count: number;
}

export class FixedWindowCounterRateLimiter implements RateLimiter {
  counters: Map<string, Counter>;

  threshold: number;

  constructor({ threshold }: FixedWindowCounterArgs) {
    this.threshold = threshold;
    this.counters = new Map<string, Counter>();
  }

  handleRequest(req: Request, res: Response, next: NextFunction) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Make sure a valid IP is present in the request.
    if (typeof ip !== 'string') {
      res
        .status(400)
        .send('Invalid x-forwarded-for header or remote address\n');
      return;
    }

    const counter = this.counters.get(ip);
    const currentWindow = Math.floor(new Date().getTime() / 1000);

    // If this is the first request from the given IP, or the window is changed
    if (counter === undefined || counter.window != currentWindow) {
      this.counters.set(ip, {
        count: 1,
        window: currentWindow
      });
      next();
      return;
    }

    // Discard the request if the counter exceeds the threshold
    if (counter.count >= this.threshold) {
      res.status(429).send('Too many requests. Please try later!\n');
      return;
    }

    // Otherwise increase the counter.
    counter.count++;
    this.counters.set(ip, counter);
    next();
  }

  cleanup(): void {}
}
