# Challenge 22 - Write Your Own DNS Resolver

This challenge corresponds to the 22<sup>nd</sup> part of the Coding Challenges series by John Crickett https://codingchallenges.fyi/challenges/challenge-dns-resolver.

## Files and Descriptions

- `dns_query.ts`: This file contains the code for querying a server for a DNS record.
- `dns_message.ts`: This file contains the code for creating a DNS query message.
- `utils.ts`: This file contains the utility functions for converting a DNS message to a valid byte string.
- `types.ts`: All the interfaces and types used in the project are defined in this file.
- `enums.ts`: All the enums used in the project are defined in this file.
- `parser.ts`: The DNS message parser corresponding to the messages sent by server.
- `dns_resolver.ts`: The main class implementation for DNS resolution.
- `dns_resolver.index.ts`: The command line version of the DNS resolution.

## Approach

1. Created types and interface for DnsMessage and DnsQuery.

2. Added enums for Type and Classes.

3. Added utils to convert DNS message to a valid byte string.
   This included handling the header, domain strings, ip addresses and the question section.
   **Here the major roadblock was handling Buffer and performing operations on it.
   I handled it by converting the buffer into a hex string.**

4. Wrote a simple UDP based client to create a DNS query for a domain and print out the response from the server.

5. Added DNS Message Parser.
   **The major challenge here was to handle the compression of domain labels.
   This was done by maintaining a map of the domain labels and their corresponding offsets**.

6. Added automated tests for parser and RR data parsing.

7. Updated DNS Message class to take in partial headers.

8. Revamped code and added DNS Resolver class to handle automated testing.

## Usage

You can use the `ts-node` tool to run the DNS resolver as follows:

```bash
npx ts-node dns_resolver.index.ts <domain>

# Example
npx ts-node dns_resolver.index.ts google.com
```

## Run tests

To run the tests for the DNS resolution tool, go to the root directory of this repository and run the following command:

```bash
npm test src/22/
```
