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

// Change the following default data to use different configuration.
function getRateLimiterArgs(rateLimiterType: RateLimiterType): RateLimiterArgs {
  switch (rateLimiterType) {
    case RateLimiterType.TOKEN_BUCKET: {
      const arg: TokenBucketArgs = { capacity: 10, timePeriodInMs: 1000 };
      return arg;
    }
    case RateLimiterType.FIXED_WINDOW_COUNTER: {
      const arg: FixedWindowCounterArgs = { threshold: 1 };
      return arg;
    }
    case RateLimiterType.SLIDING_WINDOW_LOG: {
      const arg: SlidingWindowLogArgs = { logThreshold: 10 };
      return arg;
    }
    case RateLimiterType.SLIDING_WINDOW_COUNTER: {
      const arg: SlidingWindowCounterArgs = {
        threshold: 200,
        windowSize: 60
      };
      return arg;
    }
  }
}

const args: RateLimiterArgs = getRateLimiterArgs(rateLimiterType);

createRateLimiterServer(rateLimiterType, args, PORT, DEBUG);
