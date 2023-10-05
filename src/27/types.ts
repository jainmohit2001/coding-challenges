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
