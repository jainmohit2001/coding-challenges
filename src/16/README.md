# Challenge 16 - Write Your Own IRC Client

This challenge corresponds to the sixteenth part of the Coding Challenges series by John Crickett https://codingchallenges.fyi/challenges/challenge-irc.

## Table of contents

- [Description](#description)
- [Usage](#usage)
- [Run tests](#run-tests)
- [TODOs](#todos)

## Description

The IRC client is written using the `net` module of Node.js.
You can find more about the IRC protocol from https://datatracker.ietf.org/doc/html/rfc2812.

- `command-types.ts`: Command types returned by server and supported by client
- `parser.ts`: A parser class that parses the data sent by server into a more usable message interface
- `types.ts`: All the interface definitions are present in this file
- `utils.ts`: Utility functions used by IRC client
- `irc-client.ts`: The main IRC Client login is written here.
- `irc-client.index.ts`: A command line interface for IRC Client to interact with the server

The IRC Client supports file based logging via [winston](https://www.npmjs.com/package/winston)

The following commands are supported by the IRC Client:

- JOIN
- PART
- NICK
- PRIVMSG
- QUIT

## Usage

To use the IRC Client command line interface, you can update the following variables present in `irc-client.index.ts` and use the `ts-node` command to start the client.

```typescript
const host = 'irc.freenode.net';
const port = 6667;
const nickName = 'MJ'; // Use you nickname
const fullName = 'Mohit Jain'; // Use your full name
const debug = true; // Enable winston logging
```

```bash
npx ts-node irc-client.index.ts
```

The following commands are supported by the IRC Client:

```bash
# Connect to server
client>connect

# Join a channel
client>/join <channel-name>

# Leave a channel
client>/part <channel-name>

# Change your nickname
client>/nick <new-nickname>

# Send a message to a channel
client>/privmsg <channel-name> <message>

# Quit the IRC Client
client>/quit
```

You can also use the IRC Client Class in your own code by importing it from `irc-client.ts`.

```typescript
import IRCClient from './irc-client';

// logger is an instance of winston.Logger otherwise undefined
const client = new IRCClient(host, port, nickName, fullName, debug, logger);

// Connect the client to the server
await client.connect();

// Join a channel
await client.join([{ channel: '#cc' }]);

// Send message to a channel
client.privateMessage('#cc', 'Hello World!');

// Part a channel
await client.part({ channels: ['#cc'], partMessage: 'Bye Bye' });

// Update your nickname
await client.nick('MJ');

// Quit the server
await client.quit('Bye Bye');

// Get details about a channel
const channelDetails = client.getChannelDetails('#cc');
```

You can add listeners to different command types supported by the IRC Client. The client exposes the `on()` method as mentioned in [types.ts](https://github.com/jainmohit2001/coding-challenges/blob/416a47f715fff82964bd8def81c26ab72cfe8978/src/16/types.ts#L189).

## Run tests

To run the tests for the IRC Client, go to the root directory of this repository and run the following command:

```bash
npm run test tests/16/
```

The tests are located in the `tests/16/` directory.

## TODOs

- [ ] Add support for multiple channels for JOIN and PART commands.
- [ ] Add command line option support for `irc-client.index.ts`.
- [ ] Separate the command handling from the main IRC client code into more a structured and scalable format.
- [ ] Improve tests.
