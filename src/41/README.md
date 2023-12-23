# Challenge 41 - Write Your Own HTTP(S) Load Tester

This challenge corresponds to the 41<sup>st</sup> part of the Coding Challenges series by John Crickett https://codingchallenges.fyi/challenges/challenge-load-tester.

## Description

The objective of the challenge is to build a HTTP(s) Load Tester that can query a given address and return some important stats such as Total Request Time, Time to First Byte, Time to Last Byte.

## Usage

You can use the `ts-node` tool to run the command line version of the NTP Client as follows:

```bash
npx ts-node <path/to/index.ts> -u <url> [-n <number-of-requests>] [-c <concurrency>]
```

### Options

- `-u <url>`: The URL on which load testing needs to be performed.

- `-n <number-of-requests>`: The number of requests sent to the server. This are sent in series. Default = 10.

- `-c <concurrency>`: The number of concurrent requests to send. Default = 1.

### Examples

```bash
# Load test https://google.com with 10 requests and 10 concurrency
npx ts-node <path-to-index.ts> -u https://google.com -n 10 -c 10
```

### Description

- [customer_request.ts](custom_request.ts): A helper function which calculates some stats while doing a network GET request. The code is inspired from https://gabrieleromanato.name/nodejs-get-the-time-to-first-byte-ttfb-of-a-website.

- [load_tester.ts](load_tester.ts): The main load tester implementation.

## Run tests

To run the tests for the Load Tester, go to the root directory of this repository and run the following command:

```bash
npm test src/41/
```
