import express from 'express';
import { TokenBucketRateLimiter } from './algorithms/token-bucket';
import {
  FixedWindowCounterArgs,
  RateLimiter,
  RateLimiterArgs,
  SlidingWindowCounterArgs,
  SlidingWindowLogArgs,
  TokenBucketArgs
} from './types';
import { RateLimiterType } from './enums';
import { FixedWindowCounterRateLimiter } from './algorithms/fixed-window-counter';
import { SlidingWindowLogRateLimiter } from './algorithms/sliding-window-log';
import { SlidingWindowCounterRateLimiter } from './algorithms/sliding-window-counter';

export const createRateLimiterServer = (
  rateLimiterType: RateLimiterType,
  args: RateLimiterArgs,
  port: number = 8080
) => {
  const app = express();

  app.use(express.json());
  app.use(express.text());

  const rateLimiter = getRateLimiter(rateLimiterType, args);

  app.use('/limited', (req, res, next) =>
    rateLimiter.handleRequest(req, res, next)
  );

  app.get('/limited', (req, res) => {
    res.send('Limited API endpoint\n');
  });

  app.get('/unlimited', (req, res) => {
    res.send('Unlimited API endpoint\n');
  });

  const server = app.listen(port, () => {
    console.log('Started server on port ' + port);
  });

  return server;
};

function getRateLimiter(
  rateLimiterType: RateLimiterType,
  args: RateLimiterArgs
): RateLimiter {
  switch (rateLimiterType) {
    case RateLimiterType.TOKEN_BUCKET: {
      return new TokenBucketRateLimiter(args as TokenBucketArgs);
    }
    case RateLimiterType.FIXED_WINDOW_COUNTER: {
      return new FixedWindowCounterRateLimiter(args as FixedWindowCounterArgs);
    }
    case RateLimiterType.SLIDING_WINDOW_LOG: {
      return new SlidingWindowLogRateLimiter(args as SlidingWindowLogArgs);
    }
    case RateLimiterType.SLIDING_WINDOW_COUNTER: {
      return new SlidingWindowCounterRateLimiter(
        args as SlidingWindowCounterArgs
      );
    }
  }
}
