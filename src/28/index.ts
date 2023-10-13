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

    const offset = client.getOffset();
    console.log(`Offset (theta) ${offset}ms`);

    const rtt = client.getRtt();
    console.log(`RTT (delta) ${rtt}ms`);

    // The correct time will be calculated based on the offset
    const now = client.now();

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
