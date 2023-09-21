import Subscription from './subscription';
import { PubArg } from './utils';

export default class Topic {
  private subject: string;
  private subscriptions: Set<Subscription>;

  constructor(subject: string, subscriptions?: Set<Subscription>) {
    this.subject = subject;
    this.subscriptions = subscriptions ?? new Set<Subscription>();
  }

  sub(subscription: Subscription) {
    this.subscriptions.add(subscription);
  }

  unsub(subscription: Subscription) {
    this.subscriptions.delete(subscription);
  }

  async publish(pubArg: PubArg): Promise<void> {
    const promises: Promise<void>[] = [];

    this.subscriptions.forEach((subscription) => {
      promises.push(
        new Promise<void>((res) => {
          const buffer = Buffer.concat([
            Buffer.from('MSG '),
            Buffer.from(this.subject + ' '),
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
}
