import MemCached from 'memcached';

import MemCachedServer from '../../src/17/memcached';
import sleep from '../../src/utils/sleep';
import { randomBytes } from 'crypto';

describe('Testing Memcached server with basic commands', () => {
  let server: MemCachedServer;
  let client: MemCached;
  const host = '127.0.0.1';
  const port = 11211;
  const key = 'test';
  const value = 1234;

  beforeAll(() => {
    server = new MemCachedServer(port, host);
  });

  afterAll(async () => {
    client.end();
    await server.stopServer();
  });

  it('Should start successfully', async () => {
    await server.startServer();
    expect(server.status).toBe('listening');
  });

  it('Should allow connection with client', (done) => {
    client = new MemCached(`${host}:${port}`, { idle: 10000 });
    client.get('123', () => {
      expect(server.getConnectedClientsCount()).toBe(1);
      done();
    });
  });

  it('set command should work successfully', (done) => {
    client.set(key, value, 0, (err, result) => {
      expect(result).toBe(true);
      done();
    });
  });

  it('get command should work successfully', (done) => {
    client.get(key, (err, data) => {
      expect(data).toBe(value);
      done();
    });
  });

  it('should return nothing when no valid key is passed', (done) => {
    client.get('randomKey', (err, data) => {
      expect(data).toBe(undefined);
      done();
    });
  });

  it('Should handle expiry time when set to non zero', (done) => {
    const delay = 4;
    const key = 'newKey';
    const value = 'newValue';
    client.set(key, value, delay, (err, result) => {
      expect(result).toBe(true);

      // Sleep for delay/2 seconds
      sleep((delay / 2) * 1000).then(() => {
        // Get the data
        client.get(key, (err, data) => {
          // Data should be present
          expect(data).toBe(value);

          // Sleep for delay / 2 seconds
          sleep((delay / 2) * 1000).then(() => {
            // Data should be absent
            client.get(key, (err, data) => {
              expect(data).toBe(undefined);
              done();
            });
          });
        });
      });
    });
  }, 10000);

  it('should handle expiry time when set to -1', (done) => {
    client.set(key, value, -1, (err, result) => {
      expect(result).toBe(true);

      client.get(key, (err, data) => {
        expect(data).toBe(undefined);
        done();
      });
    });
  });

  it('should handle add command when data is not already present', (done) => {
    const randomKey = randomBytes(4).toString('hex');
    const randomValue = randomBytes(4).toString('hex');

    client.add(randomKey, randomValue, 0, (err, result) => {
      expect(result).toBe(true);

      client.get(randomKey, (err, data) => {
        expect(data).toBe(randomValue);
        done();
      });
    });
  });

  it('should handle add command when data is already present', (done) => {
    client.set(key, value, 0, (err, result) => {
      expect(result).toBe(true);

      client.add(key, value, 0, (err, result) => {
        expect(result).toBe(false);
        done();
      });
    });
  });

  it('should handle replace command when data is already present', (done) => {
    const randomValue = randomBytes(4).toString('hex');

    client.replace(key, randomValue, 0, (err, result) => {
      expect(result).toBe(true);
      client.get(key, (err, data) => {
        expect(data).toBe(randomValue);
        done();
      });
    });
  });

  it('should handle replace command when data is not already present', (done) => {
    const randomKey = randomBytes(4).toString('hex');
    client.replace(randomKey, value, 0, (err, result) => {
      expect(result).toBe(false);
      done();
    });
  });
});
