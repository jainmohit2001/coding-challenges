import net from 'net';
import { Kind, Msg, Parser } from './parser';
import { parseSub, parseUnsubArg } from './utils';
import { Client, ClientOptions } from './client';
import { v4 as uuidv4 } from 'uuid';
import Topic from './topic';
import Subscription from './subscription';

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

export default class NATSServer {
  private port: number;
  private host: string;
  server: net.Server;
  private clients: Map<string, Client>;
  private topics: Map<string, Topic>;
  private subscriptions: Map<number, Subscription>;
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
    this.subscriptions = new Map<number, Subscription>();
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
      case Kind.UNSUB:
        this.handleUnsub(msg, client);
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
    const subscription = new Subscription(client, subArg.sid, subject);

    if (topic) {
      topic.sub(subscription);
    } else {
      topic = new Topic(subject);
      topic.sub(subscription);
      this.topics.set(topicKey, topic);
    }

    this.subscriptions.set(subArg.sid, subscription);

    client.sendOk();
  }

  private handleUnsub(msg: Msg, client: Client) {
    const unsubArg = parseUnsubArg(msg.data!);
    const subscription = this.subscriptions.get(unsubArg.sid);

    if (subscription) {
      const topic = this.topics.get(subscription.subject);

      if (topic) {
        topic.unsub(subscription);
        client.sendOk();
      } else {
        // TODO: handle when no topic present
      }
    } else {
      // TODO: handle when invalid sid is provided
    }
  }

  private async handlePub(msg: Msg, client: Client): Promise<void> {
    const pubArg = msg.pubArg!;
    const subject = pubArg.subject.toString();
    const topic = this.topics.get(subject);

    if (topic === undefined) {
      // TODO: Handle when unknown topic found
      return;
    }
    client.sendOk();
    await topic.publish(pubArg);
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
