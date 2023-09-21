import { Client } from './client';

/**
 * This class stores the information regarding a Subscription.
 *
 * @export
 * @class Subscription
 */
export default class Subscription {
  /**
   * Client object.
   *
   * @type {Client}
   */
  client: Client;

  /**
   * The unique alphanumeric subscription ID of the subject.
   *
   * @type {number}
   */
  sid: number;

  /**
   * The subject name.
   *
   * @type {string}
   */
  subject: string;

  constructor(client: Client, sid: number, subject: string) {
    this.client = client;
    this.sid = sid;
    this.subject = subject;
  }
}
