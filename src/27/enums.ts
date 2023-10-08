/**
 * Supported rate limiters
 *
 * @export
 * @enum {number}
 */
export enum RateLimiterType {
  TOKEN_BUCKET = 'token-bucket',
  FIXED_WINDOW_COUNTER = 'fixed-window-counter',
  SLIDING_WINDOW_LOG = 'sliding-window-log',
  SLIDING_WINDOW_COUNTER = 'sliding-window-counter',
  REDIS_SLIDING_WINDOW_COUNTER = 'redis-sliding-window-counter'
}
