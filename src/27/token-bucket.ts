import { NextFunction, Request, Response } from 'express';
import { RateLimiter } from './types';

const MAX_TIME_PERIOD_MS = 60 * 1000; // 60 seconds
const MIN_TIME_PERIOD_MS = 1000; // 1 second

export class TokenBucketRateLimiter implements RateLimiter {
  /**
   * Represents the maximum number of tokens allowed in a single bucket.
   *
   * @type {number}
   */
  capacity: number;

  /**
   * A map that stores the number of available tokens for each IP address.
   * Each IP has its own bucket.
   *
   */
  tokens: Map<string, number>;

  /**
   * The interval period after which 1 token will be added to all the buckets.
   *
   * @type {number}
   */
  timePeriodInMs: number;

  /**
   * Stores the Timer object reference.
   *
   * @type {NodeJS.Timer}
   */
  timer: NodeJS.Timer;

  constructor(capacity: number, timePeriodInMs: number) {
    this.capacity = capacity;
    this.tokens = new Map<string, number>();

    // Verify timePeriodInMs
    if (
      timePeriodInMs >= MIN_TIME_PERIOD_MS &&
      timePeriodInMs <= MAX_TIME_PERIOD_MS
    ) {
      this.timePeriodInMs = timePeriodInMs;
    } else {
      throw new Error(
        `Invalid timePeriod ${timePeriodInMs}. It should be >=${MIN_TIME_PERIOD_MS} and <= ${MAX_TIME_PERIOD_MS}`
      );
    }

    // Start add tokens with the provided timer period
    this.timer = setInterval(() => this.addTokens(), timePeriodInMs);
  }

  /**
   * This function adds a token to all the buckets.
   *
   * @private
   */
  private addTokens(): void {
    this.tokens.forEach((value, key) => {
      this.tokens.set(key, Math.min(this.tokens.get(key)! + 1, this.capacity));
    });
  }

  handleRequest(req: Request, res: Response, next: NextFunction): void {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Make sure a valid IP is present in the request.
    if (typeof ip !== 'string') {
      res
        .status(400)
        .send('Invalid x-forwarded-for header or remote address\n');
      return;
    }

    const tokensInBucket = this.tokens.get(ip);

    // First time encountering this ip
    // Initialize a new fully filled Bucket for this.
    if (tokensInBucket === undefined) {
      this.tokens.set(ip, this.capacity);
      next();
      return;
    }

    // If no tokens left to utilize, reject the request
    if (tokensInBucket === 0) {
      res.status(429).send('Too many requests. Please try again later\n');
      return;
    }

    // Decrement the number of tokens for this IP
    this.tokens.set(ip, tokensInBucket - 1);
    next();
  }
}
