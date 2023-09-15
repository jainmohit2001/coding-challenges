# Challenge 23 - Write Your Own Traceroute

This challenge corresponds to the 23<sup>rd</sup> part of the Coding Challenges series by John Crickett https://codingchallenges.fyi/challenges/challenge-traceroute/.

## Approach

1. Created a DNS lookup function and added command line args support

2. Created function that listens for ICMP packets.
   This part is a little tricky.
   In Node.js, there is no support for ICMP packets natively.
   Hence we have to rely on third-party packages. I went ahead and used the hotfix version of [raw-socket](https://github.com/algj/node-raw-socket/) library.
   There are some caveats for this `old package`.

   - The package does not work for Windows.
   - Moreover for Linux systems it automatically closes up. See this issue [#70](https://github.com/nospaceships/node-raw-socket/issues/70)

3. Created a UDP message sender.
   We need to ensure that the TTL is being updated along with the PORT every time this function is called.

4. Created a function that handles the timeout condition and logs relevant details when an ICMP packet is received.

## Usage

You can use the `ts-node` tool to run the DNS resolver as follows:

```bash
npx ts-node traceroute.ts <host>
```
