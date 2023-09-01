# Challenge 8 - Write Your Own Redis Server

This challenge corresponds to the eighth part of the Coding Challenges series by John Crickett https://codingchallenges.fyi/challenges/challenge-redis.

## Description

The aim of the challenge is to write a basic Redis server that can handle concurrent clients using the [RESP Protocol](https://redis.io/docs/reference/protocol-spec/).

- `redis_commands.ts`: The commands supported by the server
- `redis_client.ts`: My own class implementation of the Redis client. This is not part of the challenge, but I wanted to implement the client as well.
- `redis_client.index.ts`: Command line version of the Redis client
- `redis_server.ts`: The Redis server implementation
- `redis_server.index.ts`: Command line version of the Redis server
- `redis_serializer.ts`: The serializer used by the Redis server to serialize the data
- `redis_deserializer.ts`: The deserializer used by the Redis server to deserialize the data
- `types.ts`: The different types of objects support by RESP protocol

## Usage

To start the Redis server on the default port 6379, run the following command:

```bash
# Using ts-node
npx ts-node redis_server.index.ts

# Using node
node path/to/redis_server.index.js
```

Afterwards you can connect to the server by starting up a client session using your preferred Redis Client. See Redis CLI(https://redis.io/docs/ui/cli/) to learn more about the Redis command line interface.

## Benchmark

I have created my own benchmark tool present in `benchmark.ts`. The code is inspired from the original Redis benchmarking method https://github.com/redis/node-redis/blob/master/benchmark/lib/runner.js.

To run the benchmark, close all the previous servers and clients and run the following command:

```bash
npx ts-node benchmark.ts
```

The benchmark tool will start the Redis server and perform GET, SET and DEL operations using multiple clients.
The tool has the following parameters that can be changed as per your needs:

```typescript
const concurrency = 50; // The number of concurrent clients
const times = 100000; // The number of operations per client
const size = 1024; // The size of key and value in bytes
```

## Run tests

To run the tests for the REDIS server, go to the root directory of this repository and run the following command:

```bash
npm test src/8/
```
