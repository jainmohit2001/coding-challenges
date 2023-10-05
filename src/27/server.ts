import express from 'express';
import { TokenBucketRateLimiter } from './token-bucket';
import { RateLimiter } from './types';
import { RateLimiterType } from './enums';

const PORT = 8080;

const app = express();

app.use(express.json());
app.use(express.text());

// Change this line to use a different rateLimiter
const rateLimitedType: RateLimiterType = RateLimiterType.TOKEN_BUCKET;

let rateLimiter: RateLimiter;

// Assign rate limiter
switch (rateLimitedType) {
  case RateLimiterType.TOKEN_BUCKET: {
    // Config for the Token Bucket Rate limiter
    const CAPACITY = 10;
    const TIME_PERIOD_IN_MS = 1000;

    rateLimiter = new TokenBucketRateLimiter(CAPACITY, TIME_PERIOD_IN_MS);
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
