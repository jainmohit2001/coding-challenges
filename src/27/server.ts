import express from 'express';
import { TokenBucketRateLimiter } from './algorithms/token-bucket';
import { RateLimiter } from './types';
import { RateLimiterType } from './enums';
import { FixedWindowCounterRateLimiter } from './algorithms/fixed-window-counter';
import { Argument, program } from 'commander';
import { SlidingWindowLogRateLimiter } from './algorithms/sliding-window-log';
import { SlidingWindowCounterRateLimiter } from './algorithms/sliding-window-counter';

program.addArgument(
  new Argument(
    '<algorithm>',
    'The algorithm to use for the rate limiter'
  ).choices(Object.values(RateLimiterType))
);
program.parse();

const rateLimiterType = program.args[0] as RateLimiterType;
const PORT = 8080;

const app = express();

app.use(express.json());
app.use(express.text());

let rateLimiter: RateLimiter;

// Assign rate limiter
switch (rateLimiterType) {
  case RateLimiterType.TOKEN_BUCKET: {
    // Config for the Token Bucket Rate Limiter
    const capacity = 10;
    const timePeriodInMs = 1000;

    rateLimiter = new TokenBucketRateLimiter(capacity, timePeriodInMs);
    break;
  }
  case RateLimiterType.FIXED_WINDOW_COUNTER: {
    // Config for the Fixed Window Counter Rate Limiter
    const windowSize = 60;
    const threshold = 200;

    rateLimiter = new FixedWindowCounterRateLimiter(windowSize, threshold);
    break;
  }
  case RateLimiterType.SLIDING_WINDOW_LOG: {
    // Config for the Sliding Window Log Rate Limiter
    const logThreshold = 10;

    rateLimiter = new SlidingWindowLogRateLimiter(logThreshold);
    break;
  }
  case RateLimiterType.SLIDING_WINDOW_COUNTER: {
    // COnfig for the Sliding Window Counter Rate Limiter
    const windowSize = 60;
    const threshold = 200;

    rateLimiter = new SlidingWindowCounterRateLimiter(windowSize, threshold);
    break;
  }
}

app.use('/limited', (req, res, next) =>
  rateLimiter.handleRequest(req, res, next)
);

app.get('/limited', (req, res) => {
  res.send('Limited API endpoint\n');
});

app.get('/unlimited', (req, res) => {
  res.send('Unlimited API endpoint\n');
});

app.listen(PORT, () => {
  console.log('Started server on port ' + PORT);
});
