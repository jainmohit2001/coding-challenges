import { NTP_VERSION } from '../constants';
import { NtpClient } from '../ntp-client';

describe('Testing NTP client', () => {
  const timeout = 5000;
  const server = '0.pool.ntp.org';

  it('should should send NTP request and wait for reply', (done) => {
    const client = new NtpClient(server, timeout);
    client.getTime().then((packet) => {
      expect(packet.leap).toBe(0);
      expect(packet.version).toBe(NTP_VERSION);
      expect(packet.mode).toBe(4);

      expect(() => client.getOffset()).not.toThrow();
      expect(() => client.getRtt()).not.toThrow();
      expect(() => client.now()).not.toThrow();

      done();
    });
  });

  it('should timeout if no packet received', (done) => {
    const client = new NtpClient(server, 10);
    client.getTime().catch((err) => {
      expect(err.toString()).toContain('Timeout');
      done();
    });
  });
});
