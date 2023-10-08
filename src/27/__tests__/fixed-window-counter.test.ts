import axios from 'axios';
import { RateLimiterType } from '../enums';
import { createRateLimiterServer } from '../server';
import { FixedWindowCounterArgs } from '../types';
import sleep from '../../utils/sleep';

describe('Testing fixed window counter rate limiter', () => {
  const args: FixedWindowCounterArgs = { threshold: 2 };
  const rateLimiterType = RateLimiterType.FIXED_WINDOW_COUNTER;
  const port = 8080;
  const serverUrl = 'http://127.0.0.1:8080/limited';

  const server = createRateLimiterServer(rateLimiterType, args, port);
  const client = axios.create({ validateStatus: () => true });

  afterAll((done) => {
    server.close(() => {
      done();
    });
  });

  it('should reject requests after threshold is reached', async () => {
    const promises = [];
    for (let i = 0; i <= args.threshold; i++) {
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
    expect(accepted).toBe(args.threshold);
    expect(rejected).toBe(1);
  });

  it('should allow requests in the next window', async () => {
    await sleep(1000);
    const result = await client.get(serverUrl);
    expect(result.status).toBe(200);
  });
});
