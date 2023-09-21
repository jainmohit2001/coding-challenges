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

    // Data before the `sid` goes in prefix
    // This is same for all the messages during this publish call.
    const prefix: Buffer = Buffer.concat([
      Buffer.from('MSG '),
      Buffer.from(this.subject + ' ')
    ]);

    // Data after `sid` goes in suffix.
    // This is same for all the messages during this publish call.
    let suffix: Buffer;
    if (pubArg.payload) {
      suffix = Buffer.concat([
        Buffer.from(pubArg.payloadSize.toString(10) + '\r\n'),
        pubArg.payload,
        Buffer.from('\r\n')
      ]);
    } else {
      suffix = Buffer.from('0\r\n\r\n');
    }

    this.subscriptions.forEach((subscription) => {
      promises.push(
        new Promise<void>((res) => {
          // Prepare final message
          const buffer = Buffer.concat([
            prefix,
            Buffer.from(subscription.sid.toString(10) + ' '),
            suffix
          ]);

          // Send the message and complete the promise
          subscription.client.socket.write(buffer);
          res();
        })
      );
    });

    await Promise.all(promises);
  }
}
