import { Stats, customRequest } from './custom_request';

type LoadTesterParams = {
  numberOfRequests: number;
  concurrency: number;
  url: string;
};

type TMinMaxMean = {
  min: number;
  max: number;
  mean: number;
};

type TLoadTesterReturn = {
  totalRequests: number;
  successes: number;
  failures: number;
  totalTimeRequestMs: TMinMaxMean;
  ttfbMs: TMinMaxMean;
  ttlbMs: TMinMaxMean;
  reqPerSec: number;
};

async function makeRequest(
  url: string,
  numberOfRequests: number = 10
): Promise<Stats[]> {
  const stats: Stats[] = [];
  for (let i = 0; i < numberOfRequests; i++) {
    try {
      stats.push(await customRequest(url));
    } catch (_) {
      stats.push({
        body: '',
        statusCode: 500,
        trtMs: -1,
        ttfbMs: -1,
        ttlbMs: -1
      });
    }
  }
  return stats;
}

export async function loadTester({
  numberOfRequests,
  concurrency,
  url
}: LoadTesterParams): Promise<TLoadTesterReturn> {
  const startTime = process.hrtime.bigint();

  const promises = [];
  for (let i = 0; i < concurrency; i++) {
    promises.push(makeRequest(url, numberOfRequests));
  }
  const statLists = await Promise.all(promises);

  const endTime = process.hrtime.bigint();

  let successes = 0,
    failures = 0;

  // Max, Min and Mean for [ttfb, ttlb, trt]
  const max = [-1, -1, -1],
    min = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE],
    mean = [0, 0, 0];

  statLists.forEach((stats) => {
    stats.forEach((stat) => {
      if (stat.statusCode >= 200 && stat.statusCode <= 299) {
        successes++;

        // ttfbMs
        if (stat.ttfbMs > max[0]) {
          max[0] = stat.ttfbMs;
        }
        if (stat.ttfbMs < min[0]) {
          min[0] = stat.ttfbMs;
        }
        mean[0] += stat.ttfbMs;

        // ttlbMs
        if (stat.ttlbMs > max[1]) {
          max[1] = stat.ttlbMs;
        }
        if (stat.ttlbMs < min[1]) {
          min[1] = stat.ttlbMs;
        }
        mean[1] += stat.ttlbMs;

        // trtMs
        if (stat.trtMs > max[2]) {
          max[2] = stat.trtMs;
        }
        if (stat.trtMs < min[2]) {
          min[2] = stat.trtMs;
        }
        mean[2] += stat.trtMs;
      } else {
        failures++;
      }
    });
  });

  mean[0] = Number((mean[0] / successes).toFixed(4));
  mean[1] = Number((mean[1] / successes).toFixed(4));
  mean[2] = Number((mean[2] / successes).toFixed(4));

  return {
    totalRequests: numberOfRequests * concurrency,
    successes,
    failures,
    ttfbMs: { min: min[0], max: max[0], mean: mean[0] },
    ttlbMs: { min: min[1], max: max[1], mean: mean[1] },
    totalTimeRequestMs: { min: min[2], max: max[2], mean: mean[2] },
    reqPerSec: Number(
      (successes / (Number(endTime - startTime) / 1000_000_000)).toFixed(2)
    )
  };
}
