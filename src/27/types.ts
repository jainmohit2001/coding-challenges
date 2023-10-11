import { NextFunction, Request, Response } from 'express';
import Client from 'ioredis';
import Redlock from 'redlock';

/**
 * This is a generic interface that a Rate limiter has to implement.
 *
 * @export
 * @interface RateLimiter
 */
export interface RateLimiter {
  handleRequest(req: Request, res: Response, next: NextFunction): void;

  cleanup(): void;
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
   * The maximum number of requests allowed in a second.
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
   * The maximum number of requests allowed in a second.
   *
   * @type {number}
   */
  threshold: number;
};

export type RedisSlidingWindowCounterArgs = {
  /**
   * The maximum number of requests allowed in a second.
   *
   * @type {number}
   */
  threshold: number;

  client: Client.Redis;

  /**
   * Used for locking data in Redis server.
   *
   * @type {Redlock}
   */
  redlock: Redlock;
};

export type RateLimiterArgs =
  | TokenBucketArgs
  | FixedWindowCounterArgs
  | SlidingWindowLogArgs
  | SlidingWindowCounterArgs
  | RedisSlidingWindowCounterArgs;
