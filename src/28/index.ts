import { program } from 'commander';
import { NtpClient } from './ntp-client';

const client = new NtpClient();

program.option('--setTime', 'Set the system timestamp');

program.parse();

const options = program.opts();

client
  .getTime()
  .then((msg) => {
    console.log('NTP Packet', msg);

    const offset = client.offset();
    console.log(`Offset (theta) ${offset}ms`);

    const rtt = client.rtt();
    console.log(`RTT (delta) ${rtt}ms`);

    // The time will be calculated based on the offset
    const now = new Date();
    now.setTime(now.getTime() + offset);

    if (options.setTime) {
      client
        .setSystemTime(now)
        .then(() => {
          console.log('Successfully set system time');
        })
        .catch((err) => {
          console.error(err);
        });
    }
  })
  .catch((err) => {
    console.error(err);
  });
