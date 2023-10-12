import { NtpClient } from './client';

import { calculateOffset, calculateRoundTripDelay } from './ntp-packet';

const client = new NtpClient();

client
  .getTime()
  .then((msg) => {
    console.log(msg);
    console.log(`Offset (theta) ${calculateOffset(msg)}ms`);
    console.log(`RTT (delta) ${calculateRoundTripDelay(msg)}ms`);
  })
  .catch((err) => {
    console.error(err);
  });
