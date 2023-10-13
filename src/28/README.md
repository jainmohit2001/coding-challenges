# Challenge 28 - Write Your Own NTP Client

This challenge corresponds to the 28<sup>th</sup> part of the Coding Challenges series by John Crickett https://codingchallenges.fyi/challenges/challenge-ntp.

## Description

The objective of the challenge is to build a NTP client that can find the correct system time using the Network Time Protocol defined in [RFC5905](https://datatracker.ietf.org/doc/html/rfc5905).

## Usage

You can use the `ts-node` tool to run the command line version of the NTP Client as follows:

```bash
npx ts-node <path/to/index.ts> [--setTime]
```

### Options

- `--setTime`: If true, then the system time will be updated. It currently supports Linux systems only.

Or you can directly use the `NtpClient` class defined in [ntp-client.ts](ntp-client.ts) as follows:

```typescript
import { NtpClient } from '<path/to/ntp-client.ts>';

const server = '0.pool.ntp.org';
const timeout = 5000;

const client = new NtpClient(server, timeout);
client
  .getTime()
  .then((msg) => {
    console.log('NTP Packet', msg);

    const offset = client.getOffset();
    console.log(`Offset (theta) ${offset}ms`);

    const rtt = client.getRtt();
    console.log(`RTT (delta) ${rtt}ms`);

    // Calculate the correct time as per server's response and offset calculation
    const now = client.now();

    // Set system time
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
```

## Run tests

To run the tests for the NTP Client, go to the root directory of this repository and run the following command:

```bash
npm test src/28/
```
