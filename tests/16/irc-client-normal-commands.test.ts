import path from 'path';
import { createLogger, format, transports } from 'winston';
import { IRCClientInterface } from '../../src/16/types';
import IRCClient from '../../src/16/irc-client';

const host = 'irc.freenode.net';
const port = 6667;
const nickName = 'MJ';
const fullName = 'Mohit Jain';
const channel = '#cc';
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

describe('Testing IRC Client normal commands', () => {
  let client: IRCClientInterface;

  beforeAll(async () => {
    client = new IRCClient(host, port, nickName, fullName, true, logger);
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

  it('Should send PRIVMSG successfully after joining a channel', async () => {
    await client.join([{ channel: channel }]);
    expect(client.getChannelDetails(channel)?.channel).toBe(channel);
    client.privateMessage(channel, 'Hello World');
  });
});
