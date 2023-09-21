import { Client } from './client';

export default class Subscription {
  client: Client;
  sid: number;
  subject: string;

  constructor(client: Client, sid: number, subject: string) {
    this.client = client;
    this.sid = sid;
    this.subject = subject;
  }
}
