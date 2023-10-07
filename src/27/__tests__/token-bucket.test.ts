import axios from 'axios';
import { RateLimiterType } from '../enums';
import { createRateLimiterServer } from '../server';
import { TokenBucketArgs } from '../types';
import sleep from '../../utils/sleep';

describe('Testing token bucket rate limiter', () => {
  const rateLimiterType = RateLimiterType.TOKEN_BUCKET;
  const port = 8080;
  const args: TokenBucketArgs = {
    capacity: 5,
    timePeriodInMs: 1000
  };
  const serverUrl = 'http://127.0.0.1:8080/limited';

  const server = createRateLimiterServer(rateLimiterType, args, port);
  const client = axios.create({ validateStatus: () => true });

  afterAll((done) => {
    server.close(() => {
      done();
    });
  });

  it('should reject requests after tokens are empty', async () => {
    // Empty all the tokens
    const promises = [];
    for (let i = 0; i < args.capacity; i++) {
      promises.push(client.get(serverUrl));
    }

    const responses = await Promise.all(promises);
    responses.forEach((response) => {
      expect(response.status).toBe(200);
    });

    // Next request should get reject
    const response = await client.get(serverUrl);
    expect(response.status).toBe(429);
  });

  it(
    'should add token after timerPeriod has passed',
    async () => {
      await sleep(args.timePeriodInMs);
      const response = await client.get(serverUrl);
      expect(response.status).toBe(200);
    },
    2 * args.timePeriodInMs
  );
});
