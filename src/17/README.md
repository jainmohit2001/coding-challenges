# Challenge 17 - Write Your Own Memcached Server

This challenge corresponds to the seventeenth part of the Coding Challenges series by John Crickett https://codingchallenges.fyi/challenges/challenge-memcached.

## Description

This is a simple implementation of a Memcached server written in Node.js using the `net` module.

The server supports the following commands:

- `get`: Get the value corresponding to the provided key
- `set`: Set a key value pair
- `add`: Add a key value pair if not already present
- `replace`: Replace a key value pair if present

The server also supports the `expTime`, and `noreply` feature.

The `command.ts` file exports a function that parses the information about the command sent by the client and returns an instance of `MemCommand` class which is used by the server to handle the execution of the command.

## Usage

To start the server, use the `ts-node` command:

```bash
npx ts-node memcached.index.ts -p 11211
```

Or using the node command:

```bash
node path/to/memcached.index.js -p 11211
```

## Run tests

To run the tests for the IRC Client, go to the root directory of this repository and run the following command:

```bash
npm test src/17/
```
