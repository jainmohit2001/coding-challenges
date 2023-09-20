import net from 'net';
import { Kind, Msg, Parser } from './parser';
import { PubArg, parseSub } from './utils';
import { Client, ClientOptions } from './client';
import { v4 as uuidv4 } from 'uuid';

interface ServerInfo {
  server_id: string;
  server_name: string;
  version: string;
  go: string;
  host: string;
  port: number;
  headers: boolean;
  max_payload: number;
  proto: number;
}

interface Subscription {
  client: Client;
  sid: number;
}

interface Topic {
  subject: string;
  subscribers: Set<Subscription>;
}

export default class NATSServer {
  private port: number;
  private host: string;
  server: net.Server;
  private clients: Map<string, Client>;
  private topics: Map<string, Topic>;
  private debug: boolean;
  private serverInfo: ServerInfo;

  constructor(port: number, host: string = '0.0.0.0', debug: boolean = false) {
    this.port = port;
    this.host = host;
    this.server = new net.Server();
    this.clients = new Map<string, Client>();
    this.topics = new Map<string, Topic>();
    this.debug = debug;
    this.serverInfo = {
      server_id: uuidv4().replaceAll('-', ''),
      server_name: host,
      version: '2.6.1',
      go: 'go1.21.1',
      host,
      port,
      headers: false,
      max_payload: 1024 * 30,
      proto: 1
    };
  }

  startServer(): void {
    this.server.listen(this.port, this.host, () => {
      if (this.debug) {
        console.log(`Started listening on port ${this.port}`);
      }
    });

    this.server.on('error', (err) => {
      console.error(err);
    });

    this.server.on('connection', (socket) => {
      const key = `${socket.remoteAddress}:${socket.remotePort}`;

      if (this.debug) {
        console.log('Client connect %s', key);
      }

      const client: Client = new Client(key, socket);

      const cb = (msg: Msg) => {
        this.handleMessage(msg, client);
      };

      const parser = new Parser(cb);

      socket.on('close', () => {
        if (this.debug) {
          console.log('Client disconnected %s', key);
        }
        this.clients.delete(key);
      });

      socket.on('error', (err) => {
        console.error(err);
      });

      socket.on('data', (data) => {
        if (this.debug) {
          console.log('%s', data);
        }
        try {
          parser.parse(data);
        } catch (e) {
          console.error(e);
        }
      });

      this.sendInfo(client);
    });

    this;
  }

  private async handleMessage(msg: Msg, client: Client) {
    switch (msg.kind) {
      case Kind.PING:
        client.sendPong();
        break;
      case Kind.CONNECT:
        this.handleConnect(msg, client);
        break;
      case Kind.SUB:
        this.handleSub(msg, client);
        break;
      case Kind.PUB:
        await this.handlePub(msg, client);
        break;
    }
  }

  private handleConnect(msg: Msg, client: Client) {
    const newOptions: ClientOptions = JSON.parse(msg.data!.toString());
    client.updateOptions(newOptions);

    this.clients.set(client.key, client);

    client.sendOk();
  }

  private handleSub(msg: Msg, client: Client) {
    const subArg = parseSub(msg.data!);
    const subject = subArg.subject.toString();
    const topicKey = subject;

    let topic = this.topics.get(topicKey);

    if (topic) {
      topic.subscribers.add({ client, sid: subArg.sid });
    } else {
      const subscribers = new Set<Subscription>();
      subscribers.add({ client, sid: subArg.sid });
      topic = { subject: subject, subscribers };
      this.topics.set(topicKey, topic);
    }

    client.sendOk();
  }

  private async handlePub(msg: Msg, client: Client): Promise<void> {
    const pubArg: PubArg = msg.pubArg!;
    const subject = pubArg.subject.toString();
    const topic = this.topics.get(subject);

    if (topic === undefined) {
      // TODO: Handle when unknown topic found
      return;
    }
    client.sendOk();

    const promises: Promise<void>[] = [];
    topic.subscribers.forEach((subscription) => {
      promises.push(
        new Promise<void>((res) => {
          const buffer = Buffer.concat([
            Buffer.from('MSG '),
            Buffer.from(subject + ' '),
            Buffer.from(subscription.sid.toString(10) + ' '),
            Buffer.from(pubArg.payloadSize.toString(10) + ' \r\n'),
            Buffer.from((pubArg.payload ?? '') + '\r\n')
          ]);
          subscription.client.socket.write(buffer);
          res();
        })
      );
    });

    await Promise.all(promises);
  }

  private sendInfo(client: Client) {
    client.socket.write(`INFO ${JSON.stringify(this.serverInfo)}\r\n`);
  }

  async stopServer(): Promise<void> {
    return new Promise<void>((res, rej) => {
      this.server.close((err) => {
        if (err) {
          rej(err);
          return;
        }
        res();
      });
    });
  }
}
