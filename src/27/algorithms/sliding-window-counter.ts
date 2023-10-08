import { RateLimiter, SlidingWindowCounterArgs } from '../types';
import { Request, Response, NextFunction } from 'express';

interface Counter {
  /**
   * Stores the counter corresponding to previous Window.
   *
   * @type {number}
   */
  prevCounter: number;

  /**
   * Stores the timestamp of the previous Window.
   *
   * @type {Date}
   */
  prevWindow: Date;

  /**
   * Stores the counter corresponding to current Window.
   *
   * @type {number}
   */
  currentCounter: number;

  /**
   * Stores the timestamp of the current Window.
   *
   * @type {Date}
   */
  currentWindow: Date;
}

export class SlidingWindowCounterRateLimiter implements RateLimiter {
  /**
   * Storage for the previous and current counter information for each IP.
   *
   * @type {Map<string, Counter>}
   */
  counters: Map<string, Counter>;

  windowSize: number;

  threshold: number;

  private twiceWindowSize: number;

  constructor({ windowSize, threshold }: SlidingWindowCounterArgs) {
    // Ensure window size is a multiple of 60
    if (windowSize % 60 !== 0) {
      throw new Error('Window size should be multiple of 60');
    }

    this.twiceWindowSize = 2 * windowSize;
    this.windowSize = windowSize;
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
    const requestTimestamp = new Date();

    const currentDateFloor = new Date();
    currentDateFloor.setSeconds(0);

    const prevDateFloor = new Date();
    prevDateFloor.setSeconds(-prevDateFloor.getSeconds() - this.windowSize);

    // If this is the first request from the given IP
    if (counter === undefined) {
      this.counters.set(ip, {
        currentCounter: 1,
        currentWindow: currentDateFloor,
        prevCounter: 0,
        prevWindow: prevDateFloor
      });
      next();
      return;
    }

    // Check if we need to update the prev window
    if (
      (requestTimestamp.getTime() - counter.prevWindow.getTime()) / 1000 >
      this.twiceWindowSize
    ) {
      // The previous window is now expired
      counter.prevCounter = 0;
      counter.prevWindow = prevDateFloor;
    } else {
      counter.prevCounter = counter.currentCounter;
      counter.prevWindow = counter.currentWindow;
    }

    // Check if we need to update the current window
    if (
      (requestTimestamp.getTime() - counter.currentWindow.getTime()) / 1000 >
      this.windowSize
    ) {
      counter.currentWindow = currentDateFloor;
      counter.currentCounter = 0;
    }

    const currentWindowWeight =
      (this.windowSize -
        (requestTimestamp.getTime() - counter.currentWindow.getTime()) / 1000) /
      this.windowSize;

    const prevWindowWeight = 1 - currentWindowWeight;

    const count =
      counter.currentCounter * currentWindowWeight +
      counter.prevCounter * prevWindowWeight;

    // If the count is higher than the threshold, then reject the request
    if (count > this.threshold) {
      res.status(429).send('Too many requests. Please try again later\n');

      // Update the counters for this IP
      this.counters.set(ip, counter);
      return;
    }

    // update the current counter for this IP
    counter.currentCounter++;
    this.counters.set(ip, counter);
    next();
  }

  cleanup(): void {}
}
