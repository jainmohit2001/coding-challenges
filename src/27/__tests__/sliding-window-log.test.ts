import axios from 'axios';
import { RateLimiterType } from '../enums';
import { createRateLimiterServer } from '../server';
import { SlidingWindowLogArgs } from '../types';
import sleep from '../../utils/sleep';

describe('Testing sliding window log rate limiter', () => {
  const args: SlidingWindowLogArgs = { logThreshold: 5 };
  const rateLimiterType = RateLimiterType.SLIDING_WINDOW_LOG;
  const port = 8080;
  const serverUrl = 'http://127.0.0.1:8080/limited';

  const { server } = createRateLimiterServer(rateLimiterType, args, port);
  const client = axios.create({ validateStatus: () => true });

  afterAll((done) => {
    server.close(() => {
      done();
    });
  });

  it('should reject requests after log threshold is reached', async () => {
    const promises = [];
    for (let i = 0; i <= args.logThreshold; i++) {
      promises.push(client.get(serverUrl));
    }
    const results = await Promise.all(promises);

    let accepted = 0;
    let rejected = 0;

    results.forEach((result) => {
      if (result.status === 200) {
        accepted++;
      } else if (result.status === 429) {
        rejected++;
      }
    });

    expect(accepted).toBe(args.logThreshold);
    expect(rejected).toBe(1);
  });

  it('should allow requests in the next window', async () => {
    await sleep(1000);
    const result = await client.get(serverUrl);
    expect(result.status).toBe(200);
  });
});
