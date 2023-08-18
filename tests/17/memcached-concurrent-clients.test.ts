import MemCached from 'memcached';
import MemCachedServer from '../../src/17/memcached';

describe('Handling concurrent clients', () => {
  const key1 = 'test1',
    key2 = 'test2';
  const value1 = 1234,
    value2 = 12345;

  let client1: MemCached, client2: MemCached;

  const host = '127.0.0.1';
  const port = 11211;
  const server = new MemCachedServer(port, host);

  beforeAll(async () => {
    await server.startServer();
    client1 = new MemCached(`${host}:${port}`);
    client2 = new MemCached(`${host}:${port}`);
  });

  afterAll(async () => {
    client1.end();
    client2.end();
    await server.stopServer();
  });

  it('Should handle set command concurrently', async () => {
    const p1 = new Promise<boolean>((res, rej) => {
      client1.set(key1, value1, 0, (err, result) => {
        if (err) {
          rej(err);
        }
        res(result);
      });
    });

    const p2 = new Promise<boolean>((res, rej) => {
      client2.set(key2, value2, 0, (err, result) => {
        if (err) {
          rej(err);
        }
        res(result);
      });
    });

    const values = await Promise.all([p1, p2]);
    expect(values).toStrictEqual([true, true]);
  });

  it('Should handle get command concurrently', async () => {
    const p1 = new Promise<unknown>((res, rej) => {
      client1.get(key1, (err, data) => {
        if (err) {
          rej(err);
        }
        res(data);
      });
    });

    const p2 = new Promise<unknown>((res, rej) => {
      client2.get(key2, (err, data) => {
        if (err) {
          rej(err);
        }
        res(data);
      });
    });

    const values = await Promise.all([p1, p2]);
    expect(values).toStrictEqual([value1, value2]);
  });
});
