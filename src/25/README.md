# Challenge 25 - Write Your Own NATS Message Broker

This challenge corresponds to the 25<sup>th</sup> part of the Coding Challenges series by John Crickett https://codingchallenges.fyi/challenges/challenge-nats.

## Description

This is a Node.js implementation for the NATS server protocol.
The server supports the following client commands:

- [CONNECT](https://docs.nats.io/reference/reference-protocols/nats-protocol#connect) (with additional args and `verbose` support)

- [PING](https://docs.nats.io/reference/reference-protocols/nats-protocol#ping-pong)

- [PUB](https://docs.nats.io/reference/reference-protocols/nats-protocol#pub) (Basic support excluding `reply-to` arg)

- [SUB](https://docs.nats.io/reference/reference-protocols/nats-protocol#sub) (Basic support excluding `queue-group` arg)

- [UNSUB](https://docs.nats.io/reference/reference-protocols/nats-protocol#unsub) (Basic support excluding `max_msgs` arg)

## Approach

1. Created a NATS message Parser using TDD ([`parser.ts`](./parser.ts)).
   A new method: 'Zero allocation byte parsing' was explored here.
   The original NATS parser is written in `go` can be found [here](https://github.com/nats-io/nats-server/blob/45e6812d70e42891ea2ff57e0a9a6051fa5a1d27/server/parser.go#L134).

2. Created [server.ts](./server.ts) to handle CONNECT, PING and PONG commands.
   Also created [client.ts](./client.ts) to store information regarding a NATS client.

3. Created different classes for [topics](./topic.ts) and [subscriptions](./subscription.ts).

4. Added functionality for PUB and SUB commands.

5. Added functionality for UNSUB command.

6. Added E2E tests for all the commands using the [NATS.js](https://github.com/nats-io/nats.js) client.

## Usage

You can use the `ts-node` tool to run the NATS server as follows:

```bash
npx ts-node index.ts [--debug]
```

The NATS server will start on port 4222 by default.

To test the NATS server, open a new terminal and start a telnet session using the following command:

```bash
telnet localhost 4222
```

As soon as the client is connect, you should see a INFO message sent by the server.

You should be able to do something like this (the client is both the publisher and the subscriber):

```telnet
CONNECT {}
+OK
SUB CC 10
+OK
PUB CC 4
MJ
+OK
MSG CC 10 4
MJ
```

## Run tests

To run the tests for the NATS server, go to the root directory of this repository and run the following command:

```bash
npm test src/25/
```

## TODOs

- Handle the case when a client sends a PUB command with valid topic name is found.
- Handle the case when a client sends a UNSUB command with no valid subscription or topic is found.
