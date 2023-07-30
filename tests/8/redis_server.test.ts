import { createClient } from 'redis';
import { RedisServer } from '../../src/8/redis_server';
import { RedisClientType } from '@redis/client';

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

  test('Testing SET and GET', async () => {
    await client.set('key', 'value');
    const value = await client.get('key');
    expect(value).toBe('value');
    await client.disconnect();
  });

  afterAll(async () => {
    await server.stopServer();
  });
});
