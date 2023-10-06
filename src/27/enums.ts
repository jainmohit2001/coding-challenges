/**
 * Supported rate limiters
 *
 * @export
 * @enum {number}
 */
export enum RateLimiterType {
  TOKEN_BUCKET = 'token-bucket',
  FIXED_WINDOW_COUNTER = 'fixed-window-counter',
  SLIDING_WINDOW_LOG = 'sliding-window-log'
}
