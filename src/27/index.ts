import { Argument, program } from 'commander';
import { RateLimiterType } from './enums';
import { createRateLimiterServer } from './server';
import {
  FixedWindowCounterArgs,
  RateLimiterArgs,
  RedisSlidingWindowCounterArgs,
  SlidingWindowCounterArgs,
  SlidingWindowLogArgs,
  TokenBucketArgs
} from './types';
import Redlock from 'redlock';
import Client from 'ioredis';

program.addArgument(
  new Argument(
    '<algorithm>',
    'The algorithm to use for the rate limiter'
  ).choices(Object.values(RateLimiterType))
);
program.option('-p, --port <port>', 'Port on which server will start', '8080');
program.option('--debug', 'Enable debugging');

program.parse();

const options = program.opts();
const rateLimiterType = program.args[0] as RateLimiterType;
const PORT = parseInt(options.port);
const DEBUG = options.debug;

// Change the following default data to use different configuration.
async function getRateLimiterArgs(
  rateLimiterType: RateLimiterType
): Promise<RateLimiterArgs> {
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
      const arg: SlidingWindowLogArgs = { logThreshold: 1 };
      return arg;
    }
    case RateLimiterType.SLIDING_WINDOW_COUNTER: {
      const arg: SlidingWindowCounterArgs = { threshold: 1 };
      return arg;
    }
    case RateLimiterType.REDIS_SLIDING_WINDOW_COUNTER: {
      const client = new Client();
      client.on('error', (err) => {
        if (DEBUG) {
          console.error(err);
        }
      });

      const redlock = new Redlock([client], {
        driftFactor: 0.01,
        retryCount: 10,
        retryDelay: 200,
        retryJitter: 200
      });

      const args: RedisSlidingWindowCounterArgs = {
        threshold: 1,
        client,
        redlock
      };
      return args;
    }
  }
}

(async () => {
  const args: RateLimiterArgs = await getRateLimiterArgs(rateLimiterType);
  createRateLimiterServer(rateLimiterType, args, PORT, DEBUG);
})();
