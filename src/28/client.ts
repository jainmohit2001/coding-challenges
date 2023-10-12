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
  server: string;
  timeout = 10000;
  client: UDP.Socket;
  replyPacket?: NtpPacket;

  constructor(server?: string) {
    this.server = server ?? '0.pool.ntp.org';
    this.client = UDP.createSocket('udp4');
  }

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

  offset(): number {
    if (!this.replyPacket) {
      throw new Error('Invalid replyPacket');
    }
    return calculateOffset(this.replyPacket);
  }

  rtt(): number {
    if (!this.replyPacket) {
      throw new Error('Invalid replyPacket');
    }
    return calculateRoundTripDelay(this.replyPacket);
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
