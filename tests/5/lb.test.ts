import request from 'supertest';
import { IBackendServer, BackendServer } from '../../src/5/be';
import { ILBServer, LBServer } from '../../src/5/lb';
import { SchedulingAlgorithm } from '../../src/5/enum';

describe('Single Server - GET /', () => {
  const BE_PORT = 8080;
  let lbServer: ILBServer;
  let beServer: IBackendServer;

  beforeAll(() => {
    lbServer = new LBServer(80, SchedulingAlgorithm.ROUND_ROBIN);
    beServer = new BackendServer(BE_PORT);
  });

  test('Responds with Hello', (done) => {
    request(lbServer.getServer())
      .get('/')
      .expect(200, beServer.responseString, done);
  });

  afterAll(() => {
    beServer.close();
    lbServer.close();
  });
});

describe('Multiple Servers Round Robin - GET /', () => {
  const BE_PORTS = [8080, 8081];
  const numberOfBackendServers = BE_PORTS.length;
  const numberOfRequests = 5;
  let lbServer: ILBServer;
  const beServers: IBackendServer[] = [];

  beforeAll(() => {
    lbServer = new LBServer(80, SchedulingAlgorithm.ROUND_ROBIN);
    BE_PORTS.forEach((port) => {
      beServers.push(new BackendServer(port));
    });
  });

  it('Responds with Hello and correct port number', async () => {
    for (let i = 0; i < numberOfRequests; i++) {
      const beServerIndex = i % numberOfBackendServers;
      const response = await request(lbServer.getServer())
        .get('/')
        .set('Content-Type', 'application/json,text/plain')
        .set('Accept', 'application/json,text/plain');
      expect(response.status).toEqual(200);
      expect(response.text).toBe(beServers[beServerIndex].responseString);
    }
  });

  afterAll(() => {
    beServers.forEach((beServer) => {
      beServer.close();
    });
    lbServer.close();
  });
});
