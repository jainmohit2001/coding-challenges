import request from 'supertest';
import { IBackendServer, BackendServer } from '../be';
import { ILBServer, LBServer } from '../lb';
import { SchedulingAlgorithm } from '../enum';

const RESPONSE_STRING = 'Hello from backend Server';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('Single Server - GET /', () => {
  const BE_PORT = 8080;
  let lbServer: ILBServer;
  let beServer: IBackendServer;

  // Initialize LB and BE Server
  beforeAll(async () => {
    beServer = new BackendServer(BE_PORT);
    lbServer = new LBServer(80, SchedulingAlgorithm.ROUND_ROBIN, 10);
    await lbServer.performHealthCheck();
  }, 10000);

  test('Responds with Hello', (done) => {
    request(lbServer.getServer()).get('/').expect(200, RESPONSE_STRING, done);
  });

  // Gracefully close LB and BE Server
  afterAll(() => {
    lbServer.close();
    beServer.close();
  });
});

describe('Multiple Servers Round Robin - GET /', () => {
  const BE_PORTS = [8080, 8081, 8082];
  const numberOfRequests = 5;
  let lbServer: ILBServer;
  const beServers: IBackendServer[] = [];

  beforeAll(async () => {
    BE_PORTS.forEach((port) => {
      beServers.push(new BackendServer(port));
    });
    lbServer = new LBServer(80, SchedulingAlgorithm.ROUND_ROBIN, 10);
    await lbServer.performHealthCheck();
  });

  it(
    'Responds with Hello and correct port number',
    async () => {
      for (let i = 0; i < numberOfRequests; i++) {
        const response = await request(lbServer.getServer())
          .get('/')
          .set('Content-Type', 'application/json,text/plain')
          .set('Accept', 'application/json,text/plain');
        expect(response.status).toEqual(200);
        expect(response.text).toBe(RESPONSE_STRING);
      }

      // Shutdown One server and try again
      beServers[0].close();
      const deletedElements = beServers.splice(0, 1);

      // Wait for Health Check
      await sleep(10 * 1000);

      for (let i = 0; i < numberOfRequests; i++) {
        const response = await request(lbServer.getServer())
          .get('/')
          .set('Content-Type', 'application/json,text/plain')
          .set('Accept', 'application/json,text/plain');
        expect(response.status).toEqual(200);
        expect(response.text).toBe(RESPONSE_STRING);
      }

      // Add the removed server again
      for (let i = 0; i < deletedElements.length; i++) {
        deletedElements[i] = new BackendServer(deletedElements[i].port);
      }
      beServers.push(...deletedElements);

      // Wait for Health Check
      await sleep(10 * 1000);

      for (let i = 0; i < numberOfRequests; i++) {
        const response = await request(lbServer.getServer())
          .get('/')
          .set('Content-Type', 'application/json,text/plain')
          .set('Accept', 'application/json,text/plain');
        expect(response.status).toEqual(200);
        expect(response.text).toBe(RESPONSE_STRING);
      }
    },
    30 * 1000
  );

  afterAll(() => {
    lbServer.close();
    beServers.forEach((beServer) => {
      beServer.close();
    });
  });
});

describe('Multiple Servers Round Robin - Parallel GET /', () => {
  const BE_PORTS = [8080, 8081, 8082];
  const numberOfRequests = 30;
  let lbServer: ILBServer;
  const beServers: IBackendServer[] = [];

  beforeAll(async () => {
    BE_PORTS.forEach((port) => {
      beServers.push(new BackendServer(port));
    });
    lbServer = new LBServer(80, SchedulingAlgorithm.ROUND_ROBIN, 10);
    await lbServer.performHealthCheck();
  });

  it(
    'Responds with Hello and correct port number',
    async () => {
      // Create parallel HTTP requests
      const tasks = [];
      for (let i = 0; i < numberOfRequests; i++) {
        tasks.push(
          request(lbServer.getServer())
            .get('/')
            .set('Content-Type', 'application/json,text/plain')
            .set('Accept', 'application/json,text/plain')
        );
      }
      await Promise.all(tasks).then((values) => {
        for (let i = 0; i < tasks.length; i++) {
          expect(values[i].status).toBe(200);
          expect(values[i].text).toBe(RESPONSE_STRING);
        }
      });
    },
    30 * 1000
  );

  afterAll(() => {
    lbServer.close();
    beServers.forEach((beServer) => {
      beServer.close();
    });
  });
});

describe('No server is alive - GET /', () => {
  let lbServer: ILBServer;

  beforeAll(async () => {
    lbServer = new LBServer(80, SchedulingAlgorithm.ROUND_ROBIN, 10);
    await lbServer.performHealthCheck();
  });

  test('Responds with 500 status code', (done) => {
    request(lbServer.getServer()).get('/').expect(500, done);
  });

  afterAll(() => {
    lbServer.close();
  });
});
