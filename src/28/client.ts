import UDP from 'dgram';
import { NtpPacket, createNtpPacket, parseNtpPacket } from './ntp-packet';
import { PORT } from './constants';

export class NtpClient {
  server: string;
  timeout = 10000;
  client: UDP.Socket;

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
          clearTimeout(timeout);
          this.client.close();
          res(packet);
        });
      });
    });
  }
}
