import { RateLimiter, SlidingWindowCounterArgs } from '../types';
import { Request, Response, NextFunction } from 'express';

export interface Counter {
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
}

export class SlidingWindowCounterRateLimiter implements RateLimiter {
  /**
   * Storage for the previous and current counter information for each IP.
   *
   * @type {Map<string, Counter>}
   */
  counters: Map<string, Counter>;

  threshold: number;

  constructor({ threshold }: SlidingWindowCounterArgs) {
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
    const requestTimestamp = new Date().getTime();

    const currentWindow = Math.floor(new Date().getTime() / 1000) * 1000;
    const prevWindow = currentWindow - 1000;

    // If this is the first request from the given IP
    if (counter === undefined) {
      this.counters.set(ip, {
        currentCounter: 1,
        currentWindow: currentWindow,
        prevCounter: 0,
        prevWindow: prevWindow
      });
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
      this.counters.set(ip, counter);
      res.status(429).send('Too many requests. Please try again later\n');
      return;
    }

    // update the current counter for this IP
    counter.currentCounter++;
    this.counters.set(ip, counter);
    next();
  }

  cleanup(): void {}
}
