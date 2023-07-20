import request from 'supertest';
import { IBackendServer, BackendServer } from '../../src/5/be';
import { ILBServer, LBServer } from '../../src/5/lb';
import { SchedulingAlgorithm } from '../../src/5/enum';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('Single Server - GET /', () => {
  const BE_PORT = 8080;
  let lbServer: ILBServer;
  let beServer: IBackendServer;

  beforeAll(async () => {
    beServer = new BackendServer(BE_PORT);
    lbServer = new LBServer(80, SchedulingAlgorithm.ROUND_ROBIN, 10);
    await lbServer.performHealthCheck();
  }, 10000);

  test('Responds with Hello', (done) => {
    request(lbServer.getServer())
      .get('/')
      .expect(200, beServer.responseString, done);
  });

  afterAll(() => {
    lbServer.close();
    beServer.close();
  });
});

describe('Multiple Servers Round Robin - GET /', () => {
  const BE_PORTS = [8080, 8081];
  const numberOfBackendServers = BE_PORTS.length;
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
        const beServerIndex = i % numberOfBackendServers;
        const response = await request(lbServer.getServer())
          .get('/')
          .set('Content-Type', 'application/json,text/plain')
          .set('Accept', 'application/json,text/plain');
        expect(response.status).toEqual(200);
        expect(response.text).toBe(beServers[beServerIndex].responseString);
      }

      // Shutdown One server and try again
      beServers[0].close();
      await sleep(10 * 1000);
      for (let i = 0; i < numberOfRequests; i++) {
        const beServerIndex = 1;
        const response = await request(lbServer.getServer())
          .get('/')
          .set('Content-Type', 'application/json,text/plain')
          .set('Accept', 'application/json,text/plain');
        expect(response.status).toEqual(200);
        expect(response.text).toBe(beServers[beServerIndex].responseString);
      }
    },
    20 * 1000
  );

  afterAll(() => {
    lbServer.close();
    beServers.forEach((beServer) => {
      beServer.close();
    });
  });
});
