import { Argument, program } from 'commander';
import { RateLimiterType } from './enums';
import { createRateLimiterServer } from './server';
import {
  FixedWindowCounterArgs,
  RateLimiterArgs,
  SlidingWindowCounterArgs,
  SlidingWindowLogArgs,
  TokenBucketArgs
} from './types';

program.addArgument(
  new Argument(
    '<algorithm>',
    'The algorithm to use for the rate limiter'
  ).choices(Object.values(RateLimiterType))
);
program.parse();

const rateLimiterType = program.args[0] as RateLimiterType;
const PORT = 8080;
const DEBUG = true;

let args: RateLimiterArgs;

// Change the following default data to use different configuration.
switch (rateLimiterType) {
  case RateLimiterType.TOKEN_BUCKET:
    args = { capacity: 10, timePeriodInMs: 1000 } as TokenBucketArgs;
    break;
  case RateLimiterType.FIXED_WINDOW_COUNTER:
    args = { windowSize: 60, threshold: 200 } as FixedWindowCounterArgs;
    break;
  case RateLimiterType.SLIDING_WINDOW_LOG:
    args = { logThreshold: 10 } as SlidingWindowLogArgs;
    break;
  case RateLimiterType.SLIDING_WINDOW_COUNTER:
    args = { windowSize: 60, threshold: 200 } as SlidingWindowCounterArgs;
    break;
}

createRateLimiterServer(rateLimiterType, args, PORT, DEBUG);
