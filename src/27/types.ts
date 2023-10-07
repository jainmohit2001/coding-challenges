import { NextFunction, Request, Response } from 'express';

/**
 * This is a generic interface that a Rate limiter has to implement.
 *
 * @export
 * @interface RateLimiter
 */
export interface RateLimiter {
  handleRequest(req: Request, res: Response, next: NextFunction): void;
}

export type TokenBucketArgs = {
  /**
   * Represents the maximum number of tokens allowed in a single bucket.
   *
   * @type {number}
   */
  capacity: number;

  /**
   * The interval period after which 1 token will be added to all the buckets.
   *
   * @type {number}
   */
  timePeriodInMs: number;
};

export type FixedWindowCounterArgs = {
  /**
   * The size of window in seconds used to track the request rate.
   *
   * @type {number}
   */
  windowSize: number;

  /**
   * The maximum number of requests allowed in a window.
   *
   * @type {number}
   */
  threshold: number;
};

export type SlidingWindowLogArgs = {
  /**
   * Maximum length of logs (requests) allowed for a single IP per second.
   *
   * @type {number}
   */
  logThreshold: number;
};

export type SlidingWindowCounterArgs = {
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
};

export type RateLimiterArgs =
  | TokenBucketArgs
  | FixedWindowCounterArgs
  | SlidingWindowLogArgs
  | SlidingWindowCounterArgs;
