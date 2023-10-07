import { NextFunction, Request, Response } from 'express';
import { RateLimiter } from '../types';

export class FixedWindowCounterRateLimiter implements RateLimiter {
  /**
   * The size of window in seconds used to track the request rate.
   *
   * @type {number}
   */
  windowSize: number;

  /**
   * The maximum number of requests allowed in the window.
   *
   * @type {number}
   */
  threshold: number;

  /**
   * The number of requests received so far in the window for each IP.
   *
   * @private
   * @type {Map<string, number>}
   */
  private counters: Map<string, number>;

  private timer: NodeJS.Timer;

  constructor(windowSize: number, threshold: number) {
    // Ensure window size is a multiple of 60
    if (windowSize % 60 !== 0) {
      throw new Error('Window size should be multiple of 60');
    }

    this.windowSize = windowSize;
    this.threshold = threshold;
    this.counters = new Map<string, number>();

    // On the next minute, call the setInterval method.
    // The windows are typically defined when second = 0.
    // Example:
    //    Request coming at 10:54:24 will be counted in the 10:54:00 window.
    const date = new Date();
    const diff = 60 - date.getSeconds();

    // TODO: Check for simultaneous access and updates - Race Conditions.
    // Or should we do this when we get the request?
    this.timer = setTimeout(() => {
      // Reset the counter after every windowSize seconds.
      this.timer = setInterval(() => this.resetCounters(), windowSize * 1000);
    }, diff * 1000);
  }

  /**
   * This function resets the counter for all the IP addresses.
   *
   * @private
   */
  private resetCounters() {
    this.counters.forEach((value, key) => {
      this.counters.set(key, 0);
    });
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

    // If this is the first request from the given IP
    if (counter === undefined) {
      this.counters.set(ip, 0);
      next();
      return;
    }

    // Discard the request if the counter exceeds the threshold
    if (counter > this.threshold) {
      res.status(429).send('Too many requests. Please try later!\n');
      return;
    }

    // Otherwise increase the counter.
    this.counters.set(ip, counter + 1);
    next();
  }
}
