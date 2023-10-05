/**
 * This Code is inspired from the client benchmark code.
 * Link: https://github.com/redis/node-redis/blob/master/benchmark/lib/runner.js
 */

import { randomBytes } from 'crypto';
import { createClient } from 'redis';
import { RedisServer } from './redis_server';

const concurrency = 50;
const times = 100000;
const size = 1024;
const host = 'redis://127.0.0.1:6379';

const randomString = () => randomBytes(size).toString('ascii');

/**
 * This function creates a Client, connects it to the server and returns two functions namely benchmark and teardown.
 *
 *    benchmark: This function returns a Promise that resolves various commands from the client library.
 *
 *    teardown: The function returns a Promise that disconnects the client.
 *
 * @async
 * @returns {unknown}
 */
async function createJob() {
  const client = createClient({
    url: host
  });
  await client.connect();

  const str = randomString();

  return {
    benchmark() {
      return Promise.all([
        client.set(str, str),
        client.get(str),
        client.del(str)
      ]);
    },
    teardown() {
      return client.disconnect();
    }
  };
}

const main = async () => {
  const server = new RedisServer();
  server.startServer();
  const { benchmark, teardown } = await createJob();

  async function run(times: number) {
    return new Promise<void>((res) => {
      let num = 0;
      let inProgress = 0;

      async function run() {
        ++inProgress;
        ++num;

        await benchmark();
        --inProgress;

        if (num < times) {
          run();
        } else if (inProgress === 0) {
          res();
        }
      }

      const toInitiate = Math.min(concurrency, times);

      // Calling run and not waiting for it creates concurrency
      for (let i = 0; i < toInitiate; i++) {
        run();
      }
    });
  }

  // warmup
  await run(Math.min(times * 0.1, 10_000));

  // benchmark
  const benchmarkStart = process.hrtime.bigint();
  await run(times);
  const benchmarkNanoseconds = process.hrtime.bigint() - benchmarkStart;

  const json = {
    times: times,
    concurrency: concurrency,
    operationsPerSecond: (times / Number(benchmarkNanoseconds)) * 1_000_000_000
  };

  console.table(json);
  await teardown();
  await server.stopServer();
};

main();
