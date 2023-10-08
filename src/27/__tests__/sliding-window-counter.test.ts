import axios from 'axios';
import { RateLimiterType } from '../enums';
import { createRateLimiterServer } from '../server';
import { SlidingWindowCounterArgs } from '../types';
import sleep from '../../utils/sleep';

interface ITestCounter {
  window: number;
  counter: number;
}

describe('Testing sliding window counter rate limiter', () => {
  const args: SlidingWindowCounterArgs = { threshold: 2 };
  const rateLimiterType = RateLimiterType.SLIDING_WINDOW_COUNTER;
  const port = 8080;
  const serverUrl = 'http://127.0.0.1:8080/limited';

  const server = createRateLimiterServer(rateLimiterType, args, port);
  const client = axios.create({ validateStatus: () => true });
  const storage = new Map<number, ITestCounter>();

  afterAll((done) => {
    server.close(() => {
      done();
    });
  });

  it('should rate limit based on previous and current counter values', async () => {
    for (let i = 0; i < 4 * args.threshold; i++) {
      await sleep(i * 100);

      const timestamp = new Date().getTime();
      const currentWindow = Math.floor(timestamp / 1000) * 1000;
      const prevWindow = currentWindow - 1000;

      const currentCounter = storage.get(currentWindow) ?? {
        counter: 0,
        window: currentWindow
      };
      const prevCounter = storage.get(prevWindow) ?? {
        counter: 0,
        window: prevWindow
      };

      const result = await client.get(serverUrl);

      const currentWindowWeight = (timestamp - currentWindow) / 1000;
      const prevWindowWeight = 1 - currentWindowWeight;
      const count =
        currentWindowWeight * currentCounter.counter +
        prevWindowWeight * prevCounter.counter;

      currentCounter.counter++;

      storage.set(currentWindow, currentCounter);
      storage.set(prevWindow, prevCounter);

      if (count >= args.threshold) {
        expect(result.status).toBe(429);
      } else {
        expect(result.status).toBe(200);
      }
    }
  });
});
