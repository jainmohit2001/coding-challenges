import Subscription from './subscription';
import { PubArg } from './utils';

/**
 * This class is responsible for creating Topic object and,
 * managing SUB, UNSUB and PUB commands for this topic.
 *
 * @export
 * @class Topic
 */
export default class Topic {
  /**
   * The subject of the Topic.
   *
   * @private
   * @type {string}
   */
  private subject: string;

  /**
   * A set of subscriptions that are subscribed to this topic.
   *
   * @private
   * @type {Set<Subscription>}
   */
  private subscriptions: Set<Subscription>;

  constructor(subject: string, subscriptions?: Set<Subscription>) {
    this.subject = subject;
    this.subscriptions = subscriptions ?? new Set<Subscription>();
  }

  /**
   * Adds the given subscription to this topic.
   *
   * @param {Subscription} subscription
   */
  sub(subscription: Subscription) {
    this.subscriptions.add(subscription);
  }

  /**
   * Removed the given subscription from this topic.
   *
   * @param {Subscription} subscription
   */
  unsub(subscription: Subscription) {
    this.subscriptions.delete(subscription);
  }

  /**
   * This async method publishes the message to all the subscribed clients.
   *
   * @async
   * @param {PubArg} pubArg
   * @returns {Promise<void>}
   */
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
