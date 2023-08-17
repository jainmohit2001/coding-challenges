import { createLogger, format, transports } from 'winston';
import IRCClient from '../../src/16/irc-client';
import { IRCClientInterface } from '../../src/16/types';
import path from 'path';

const host = 'irc.freenode.net';
const port = 6667;
const nickName = 'MJ';
const fullName = 'Mohit Jain';
const logger = createLogger({
  transports: [
    new transports.File({
      dirname: path.join(process.cwd(), 'logs'),
      filename: 'irc_client1.test.log'
    })
  ],
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  )
});

describe('Testing IRC Client error handling', () => {
  let client: IRCClientInterface;

  beforeAll(async () => {
    client = new IRCClient(host, port, nickName, fullName, true, logger);
    await client.connect();
  }, 10000);

  afterAll(async () => {
    await client.disconnect();
  });

  it('Should reject JOIN command with zero channels', () => {
    expect(async () => await client.join([])).rejects.toThrow();
  });

  it('Should reject JOIN command with more than one channels', () => {
    expect(
      async () => await client.join([{ channel: '#123' }, { channel: '#234' }])
    ).rejects.toThrow();
  });

  it('Should reject PART command with zero channels', () => {
    expect(async () => await client.part({ channels: [] })).rejects.toThrow();
  });

  it('Should reject PART command with more than one channels', () => {
    expect(
      async () => await client.part({ channels: ['#123', '#234'] })
    ).rejects.toThrow();
  });

  it('Should throw error if invalid channel name provided', () => {
    expect(
      async () => await client.part({ channels: ['#123'] })
    ).rejects.toThrow();
  });

  it('Should reject nickname with invalid length', () => {
    expect(async () => await client.nick('')).rejects.toThrow();
    expect(
      async () =>
        await client.nick('A very long nick name that no one would ever use')
    ).rejects.toThrow();
  });
});
