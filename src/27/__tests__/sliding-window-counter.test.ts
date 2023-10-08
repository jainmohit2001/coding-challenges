import axios from 'axios';
import { RateLimiterType } from '../enums';
import { createRateLimiterServer } from '../server';
import { SlidingWindowCounterArgs } from '../types';
import sleep from '../../utils/sleep';
import {
  Counter,
  SlidingWindowCounterRateLimiter
} from '../algorithms/sliding-window-counter';

describe('Testing sliding window counter rate limiter', () => {
  const args: SlidingWindowCounterArgs = { threshold: 2 };
  const rateLimiterType = RateLimiterType.SLIDING_WINDOW_COUNTER;
  const port = 8080;
  const serverUrl = 'http://127.0.0.1:8080/limited';

  const obj = createRateLimiterServer(rateLimiterType, args, port);
  const server = obj.server;
  const rateLimiter = obj.rateLimiter as SlidingWindowCounterRateLimiter;
  const client = axios.create({ validateStatus: () => true });

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

      const storage: Counter[] = [...rateLimiter.counters.values()];

      const currentWindowWeight = (timestamp - currentWindow) / 1000;
      const prevWindowWeight = 1 - currentWindowWeight;

      let count = 0;
      if (storage.length > 0) {
        const counter = storage[0];

        if (currentWindow != counter.currentWindow) {
          if (counter.currentWindow === prevWindow) {
            counter.prevCounter = counter.currentCounter;
            counter.prevWindow = counter.currentWindow;
          } else {
            counter.prevCounter = 0;
            counter.prevWindow = prevWindow;
          }
          counter.currentWindow = currentWindow;
          counter.currentCounter = 0;
        }

        count =
          currentWindowWeight * counter.currentCounter +
          prevWindowWeight * counter.prevCounter;
      }

      const result = await client.get(serverUrl);

      if (count >= args.threshold) {
        expect(result.status).toBe(429);
      } else {
        expect(result.status).toBe(200);
      }
    }
  });
});
