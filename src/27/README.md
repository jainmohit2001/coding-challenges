# Challenge 27 - Write Your Own Rate Limiter

This challenge corresponds to the 27<sup>th</sup> part of the Coding Challenges series by John Crickett https://codingchallenges.fyi/challenges/challenge-rate-limiter.

## Description

This is a Node.js implementation of the following Rate limiter algorithms:

- token bucket
- fixed window counter
- sliding window log
- sliding window counter (with Redis support)
  - Make sure to enable the support for [RedisJSON](https://redis.io/docs/data-types/json/) by either using a [Redis Stack](https://redis.io/docs/getting-started/install-stack/) or by [manually adding the module](https://redis.io/docs/data-types/json/#run-with-docker).

All the algorithms are present in [algorithms/](algorithms/) directory.
They are very well documented with self explanatory code.

**Note:** All the algorithms support rate limiting based on the client's IP address.

## Usage

You can use the `ts-node` tool to run the NATS server as follows:

```bash
npx ts-node <path/to/index.ts> <algorithm>
```

Possible values for the algorithm are:

- `token-bucket`
- `fixed-window-counter`
- `sliding-window-log`
- `sliding-window-counter`
- `redis-sliding-window-counter`

The default configurations are present in `index.ts` for the the command line version of the Rate limiter tool.

You can also use the `createRateLimiterServer` function defined in `server.ts` in your code to get total control over the configurations.

## Run tests

To run the tests for the Rate Limiter, go to the root directory of this repository and run the following command:

```bash
npm test src/27/
```

## TODO

- Add command line support for rate limiter args.
- Add Global rate limiting constraints with all algorithms.
