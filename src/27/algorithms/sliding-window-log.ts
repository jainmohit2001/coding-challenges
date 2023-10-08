import { NextFunction, Request, Response } from 'express';
import { RateLimiter, SlidingWindowLogArgs } from '../types';

const MAX_LOG_THRESHOLD = 100; // Maximum number of requests per second
const MIN_LOG_THRESHOLD = 1; // Minimum number of requests per second

export class SlidingWindowLogRateLimiter implements RateLimiter {
  /**
   * Stores the timestamp for each IP.
   *
   * @type {Map<string, Date[]>}
   */
  logs: Map<string, Date[]>;

  logThreshold: number;

  constructor({ logThreshold }: SlidingWindowLogArgs) {
    this.logs = new Map<string, Date[]>();

    // Validate logThreshold value
    if (
      logThreshold >= MIN_LOG_THRESHOLD &&
      logThreshold <= MAX_LOG_THRESHOLD
    ) {
      this.logThreshold = logThreshold;
    } else {
      throw new Error(
        `logThreshold should be between ${MIN_LOG_THRESHOLD} and ${MAX_LOG_THRESHOLD}`
      );
    }
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

    const date = new Date();

    const log = this.logs.get(ip);

    // First request for the IP
    if (log === undefined) {
      this.logs.set(ip, [date]);
      next();
      return;
    }

    // The requests before timeWindowFront will be discarded
    const timeWindowFront = date.getTime() - 1000; // 1 second less
    const newLog = log.filter((value) => value.getTime() > timeWindowFront);

    // Check if size of newLog is greater than the specified threshold
    if (newLog.length >= this.logThreshold) {
      res.status(429).send('Too many requests. Please try again later!\n');
      return;
    }

    // Add the new log entry for this request
    newLog.push(date);

    // Update the logs for this IP
    this.logs.set(ip, newLog);
    next();
  }

  cleanup(): void {}
}
