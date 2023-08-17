import { createLogger, format, transports } from 'winston';
import IRCClient from '../../src/16/irc-client';
import path from 'path';

const host = 'irc.freenode.net';
const port = 6667;
const nickName1 = 'MJ',
  nickName2 = 'Evy';
const fullName1 = 'Mohit Jain',
  fullName2 = 'Evy Energy';
const channel = '#cc';
const logger1 = createLogger({
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

const logger2 = createLogger({
  transports: [
    new transports.File({
      dirname: path.join(process.cwd(), 'logs'),
      filename: 'irc_client2.test.log'
    })
  ],
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  )
});

describe('Testing IRC Client normal commands', () => {
  let client: IRCClient;

  beforeAll(async () => {
    client = new IRCClient(host, port, nickName1, fullName1, true, logger1);
  });

  afterAll(async () => {
    await client.disconnect();
  });

  it('Should connect to server successfully', async () => {
    await client.connect();
    expect(client.connected).toBe(true);
  }, 10000);

  it('Should JOIN to a channel successfully', async () => {
    await client.join([{ channel: channel }]);
    const clientDetails = client.getChannelDetails(channel);
    expect(clientDetails?.channel).toBe(channel);
  });

  it('Should PART a channel successfully', async () => {
    await client.part({ channels: [channel], partMessage: 'Bye Bye' });
    const clientDetails = client.getChannelDetails(channel);
    expect(clientDetails).toBe(undefined);
  });

  it('Should change nickName successfully', async () => {
    const newNickName = 'newMJ';
    await client.nick(newNickName);
    expect(client.nickName).toBe(newNickName);
  });
});

describe('Testing IRC Client error handling', () => {
  let client: IRCClient;

  beforeAll(async () => {
    client = new IRCClient(host, port, nickName1, fullName1, true, logger1);
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

describe('Testing two clients joining a channel', () => {
  let client1: IRCClient;
  let client2: IRCClient;

  beforeAll(async () => {
    client1 = new IRCClient(host, port, nickName1, fullName1, true, logger1);
    client2 = new IRCClient(host, port, nickName2, fullName2, true, logger2);
    await Promise.all([client1.connect(), client2.connect()]);
  }, 10000);

  it('Both clients should be able to join same channel', async () => {
    await Promise.all([
      client1.join([{ channel: channel }]),
      client2.join([{ channel: channel }])
    ]);
    const clientDetails1 = client1.getChannelDetails(channel);
    const clientDetails2 = client2.getChannelDetails(channel);
    expect(clientDetails1?.channel).toBe(channel);
    expect(clientDetails2?.channel).toBe(channel);
  });

  it('Client1 should be able to change its nickName', async () => {
    const newNickName1 = 'MJ2';
    await client1.nick(newNickName1);
    expect(client1.nickName).toBe(newNickName1);
    expect(client2.nickName).toBe(nickName2);
  });

  afterAll(async () => {
    await Promise.all([client1.disconnect(), client2.disconnect()]);
  });
});
