import MemCached from 'memcached';

import MemCachedServer from '../../src/17/memcached';
import sleep from '../../src/utils/sleep';
import { randomBytes } from 'crypto';

describe('Testing Memcached server with basic commands', () => {
  let server: MemCachedServer;
  let client: MemCached;
  const host = '127.0.0.1';
  const port = 11211;
  const key = randomBytes(4).toString('hex');
  const value = randomBytes(4).toString('hex');

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
    const randomKey = randomBytes(4).toString('hex');
    const randomValue = randomBytes(4).toString('hex');

    client.set(randomKey, randomValue, delay, (err, result) => {
      expect(result).toBe(true);

      // Sleep for (delay / 2) seconds
      sleep((delay / 2) * 1000).then(() => {
        // Get the data
        client.get(randomKey, (err, data) => {
          // Data should be present
          expect(data).toBe(randomValue);

          // Sleep for (delay / 2 + 1) seconds
          sleep((delay / 2 + 1) * 1000).then(() => {
            // Data should be absent
            client.get(randomKey, (err, data) => {
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
    const randomKey = randomBytes(4).toString('hex');
    const randomValue = randomBytes(4).toString('hex');

    // Set the data first
    client.set(randomKey, randomValue, 0, (err, result) => {
      expect(result).toBe(true);

      // Check for add command
      client.add(randomKey, randomValue, 0, (err, result) => {
        expect(result).toBe(false);
        done();
      });
    });
  });

  it('should handle replace command when data is already present', (done) => {
    const randomKey = randomBytes(4).toString('hex');
    const randomValue = randomBytes(4).toString('hex');

    // Set a data first
    client.set(randomKey, randomValue, 0, (err, result) => {
      expect(result).toBe(true);

      // Call the replace function with the same key and new value
      const newRandomValue = randomBytes(4).toString('hex');
      client.replace(randomKey, newRandomValue, 0, (err, result) => {
        expect(result).toBe(true);

        // Cross check the new value
        client.get(randomKey, (err, data) => {
          expect(data).toBe(newRandomValue);
          done();
        });
      });
    });
  }, 10000);

  it('should handle replace command when data is not already present', (done) => {
    const randomKey = randomBytes(4).toString('hex');
    const randomValue = randomBytes(4).toString('hex');

    client.replace(randomKey, randomValue, 0, (err, result) => {
      expect(result).toBe(false);
      done();
    });
  });
});
