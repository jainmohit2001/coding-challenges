import UDP from 'dgram';
import { DnsMessage } from './dns_message';
import { ICommandWaitingForReply, IDnsResolver } from './types';
import { Queue } from '../utils/queue';

export default class DnsResolver implements IDnsResolver {
  domain;
  host;
  port;
  debug;
  private client: UDP.Socket;
  private commandsQueue: Queue<ICommandWaitingForReply>;

  constructor(
    domain: string,
    host: string,
    port: number,
    debug: boolean = false
  ) {
    this.domain = domain;
    this.host = host;
    this.port = port;
    this.debug = debug;
    this.commandsQueue = new Queue<ICommandWaitingForReply>();

    this.client = UDP.createSocket('udp4');

    this.client.on('message', (msg) => {
      const promise = this.commandsQueue.dequeue();
      if (promise) {
        promise.resolve(msg);
      }

      if (this.debug) {
        console.log(`received> ${msg.toString('hex')}`);
      }
    });
  }

  close(): void {
    this.client.close();
  }

  async sendMessage(): Promise<Buffer> {
    const message = new DnsMessage(this.domain);
    const byteString = message.toByteString();
    const messageBuffer = Buffer.from(byteString, 'hex');
    const promise = new Promise<Buffer>((res, rej) => {
      this.commandsQueue.enqueue({ resolve: res, reject: rej });
    });

    this.client.send(messageBuffer, this.port, this.host, (err) => {
      if (err) {
        this.commandsQueue.dequeue()?.reject(err);
        if (this.debug) {
          console.error('Some error occurred %s', err);
        }
      } else {
        if (this.debug) {
          console.log(`sent> ${byteString}`);
        }
      }
    });

    return await promise;
  }
}
