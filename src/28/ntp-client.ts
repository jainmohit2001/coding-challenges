import UDP from 'dgram';
import {
  NtpPacket,
  calculateOffset,
  calculateRoundTripDelay,
  createNtpPacket,
  parseNtpPacket
} from './ntp-packet';
import { PORT } from './constants';
import { exec } from 'child_process';
import os from 'os';

export class NtpClient {
  /**
   * The NTP server.
   *
   * @type {string}
   */
  server: string;

  /**
   * Timeout for the request.
   *
   * @type {number}
   */
  timeout: number;
  client: UDP.Socket;
  replyPacket?: NtpPacket;

  constructor(server?: string, timeout?: number) {
    this.server = server ?? '0.pool.ntp.org';
    this.timeout = timeout ?? 10000;
    this.client = UDP.createSocket('udp4');
  }

  /**
   * This function sends a NTP request packet and waits for the reply.
   * If no reply is sent by the server within the timeout period specified,
   * the promise is rejected.
   *
   * @returns {Promise<NtpPacket>}
   */
  getTime(): Promise<NtpPacket> {
    return new Promise<NtpPacket>((res, rej) => {
      // If no message received in the given timeout period,
      // then the client is closed and Promise is rejected.
      const timeout = setTimeout(() => {
        this.client.close();
        rej('Timeout waiting for NTP reply packet!');
      }, this.timeout);

      const packet = createNtpPacket();

      this.client.on('error', (err) => {
        clearTimeout(timeout);
        this.client.close();
        rej(err);
      });

      this.client.send(packet, PORT, this.server, (err) => {
        if (err !== null) {
          clearTimeout(timeout);
          this.client.close();
          rej(err);
          return;
        }

        // After sending the request packet, check for a message
        this.client.once('message', (msg) => {
          const packet = parseNtpPacket(msg);
          this.replyPacket = packet;
          clearTimeout(timeout);
          this.client.close();
          res(packet);
        });
      });
    });
  }

  getOffset(): number {
    if (!this.replyPacket) {
      throw new Error('Invalid replyPacket');
    }
    return calculateOffset(this.replyPacket);
  }

  getRtt(): number {
    if (!this.replyPacket) {
      throw new Error('Invalid replyPacket');
    }
    return calculateRoundTripDelay(this.replyPacket);
  }

  /**
   * Returns the correct time as per the server response and offset.
   *
   * @returns {Date}
   */
  now(): Date {
    if (!this.replyPacket) {
      throw new Error('Invalid replyPacket');
    }
    const date = new Date();
    date.setTime(date.getTime() + this.getOffset());
    return date;
  }

  setSystemTime(date: Date): Promise<void> {
    return new Promise<void>((res, rej) => {
      const platform = os.platform();
      if (platform === 'linux') {
        exec(
          `/bin/date --set="${date.toISOString()}"`,
          (err, stdout, stderr) => {
            if (err) {
              rej(err);
            } else if (stderr) {
              rej(stderr);
            } else {
              res();
            }
          }
        );
      } else {
        rej(`Setting system time for ${platform} is currently not supported`);
      }
    });
  }
}
