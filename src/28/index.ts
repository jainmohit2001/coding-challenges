import { NtpClient } from './client';

const client = new NtpClient();

client
  .getTime()
  .then((msg) => {
    console.log('NTP Packet', msg);

    const offset = client.offset();
    console.log(`Offset (theta) ${offset}ms`);

    const rtt = client.rtt();
    console.log(`RTT (delta) ${rtt}ms`);

    const now = new Date();
    now.setTime(now.getTime() + offset);

    client
      .setSystemTime(now)
      .then(() => {
        console.log('Successfully set system time');
      })
      .catch((err) => {
        console.error(err);
      });
  })
  .catch((err) => {
    console.error(err);
  });
