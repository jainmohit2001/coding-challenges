import { connect, ConnectionOptions, NatsConnection, StringCodec } from 'nats';
import NATSServer from '../server';
import sleep from '../../utils/sleep';

// NATS client config
const PORT = 4222;
const SERVERS = `localhost:${PORT}`;

// NATS server config
const HOST = undefined;
const DEBUG = false;

const opts: ConnectionOptions = {
  servers: SERVERS
};

describe('Testing NATS server connection', () => {
  let server: NATSServer;

  beforeAll(() => {
    server = new NATSServer(PORT, HOST, DEBUG);
    server.startServer();
  });

  afterAll(async () => {
    await server.stopServer();
  });

  it('should handle "CONNECT" and "PING"', async () => {
    const client = await connect(opts);
    const done = client.closed();

    await client.close();
    const err = await done;
    expect(err).not.toBeInstanceOf(Error);
  });
});

describe('Testing commands', () => {
  let server: NATSServer;
  let client: NatsConnection;
  const sc = StringCodec();
  const subject = 'CC';

  beforeAll(() => {
    server = new NATSServer(PORT, HOST, DEBUG);
    server.startServer();
  });

  afterAll(async () => {
    await server.stopServer();
  });

  beforeEach(async () => {
    client = await connect(opts);
  });

  afterEach(async () => {
    await client.close();
  });

  it('should handle "PUB" and "SUB" command', async () => {
    const sub = client.subscribe(subject);
    const messages: string[] = ['Hello', 'World'];

    (async () => {
      let i = 0;
      for await (const m of sub) {
        expect(sc.decode(m.data)).toBe(messages[i]);
        i++;
      }
    })();

    messages.forEach((msg) => {
      client.publish(subject, sc.encode(msg));
    });

    await client.drain();
  });

  it('should handle "UNSUB" command', async () => {
    const sub = client.subscribe(subject);
    const messages: string[] = ['Hello', 'World'];

    (async () => {
      let i = 0;
      for await (const m of sub) {
        expect(sc.decode(m.data)).toBe(messages[i]);
        i++;
      }
      expect(i).toBe(1);
    })();

    client.publish(subject, sc.encode(messages[0]));
    await sleep(1000);
    sub.unsubscribe();
    client.publish(subject, sc.encode(messages[1]));

    await client.drain();
  });
});
