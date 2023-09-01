import { createClient } from 'redis';
import { RedisServer } from '../redis_server';
import { RedisClientType } from '@redis/client';
import { randomBytes } from 'crypto';

describe('Testing redis commands', () => {
  const server = new RedisServer();
  let client: RedisClientType;

  beforeAll(async () => {
    server.startServer();

    client = createClient({
      url: 'redis://127.0.0.1:6379'
    });
    client.on('error', (err) => console.log('Redis Client Error', err));
    await client.connect();
  });

  test('Testing PING, and ECO', async () => {
    const randomString = randomBytes(1024).toString('ascii');

    const pingData = await client.ping(randomString);
    expect(pingData).toBe(randomString);

    const echoData = await client.echo(randomString);
    expect(echoData).toBe(randomString);
  });

  test('Testing SET, GET, and DEL', async () => {
    const randomString = randomBytes(1024).toString('ascii');
    await client.set(randomString, randomString);

    const value = await client.get(randomString);
    expect(value).toBe(randomString);

    const deletedElements = await client.del(randomString);
    expect(deletedElements).toBe(1);

    const deletedElement = await client.del(
      randomBytes(1024).toString('ascii')
    );
    expect(deletedElement).toBe(0);
  });

  afterAll(async () => {
    await client.disconnect();
    await server.stopServer();
  });
});

describe('Testing parallel commands from same client', () => {
  const server = new RedisServer(undefined, undefined, false);
  let client: RedisClientType;

  beforeAll(async () => {
    server.startServer();

    client = createClient({
      url: 'redis://127.0.0.1:6379'
    });
    client.on('error', (err) => console.log('Redis Client Error', err));
    await client.connect();
  });

  test('Testing Parallel SET and GET', async () => {
    const randomString = randomBytes(1024).toString('ascii');
    await Promise.all([
      client.set(randomString, randomString),
      client.get(randomString),
      client.del(randomString)
    ]);
  });

  afterAll(async () => {
    await client.disconnect();
    await server.stopServer();
  });
});

describe('Testing parallel commands from same client', () => {
  const server = new RedisServer(undefined, undefined, false);
  let client1: RedisClientType;
  let client2: RedisClientType;

  beforeAll(async () => {
    server.startServer();

    client1 = createClient({
      url: 'redis://127.0.0.1:6379'
    });
    client1.on('error', (err) => console.log('Redis Client Error', err));
    await client1.connect();

    client2 = createClient({
      url: 'redis://127.0.0.1:6379'
    });
    client2.on('error', (err) => console.log('Redis Client Error', err));
    await client2.connect();
  });

  test('Testing Parallel SET and GET', async () => {
    const randomString = randomBytes(1024).toString('ascii');
    await Promise.all([
      Promise.all([
        client1.set(randomString, randomString),
        client1.get(randomString),
        client1.del(randomString)
      ]),
      Promise.all([
        client2.set(randomString, randomString),
        client2.get(randomString),
        client1.del(randomString)
      ])
    ]);
  });

  afterAll(async () => {
    await client1.disconnect();
    await client2.disconnect();
    await server.stopServer();
  });
});
