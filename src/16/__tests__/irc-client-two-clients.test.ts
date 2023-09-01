import { createLogger, format, transports } from 'winston';
import IRCClient from '../irc-client';
import path from 'path';
import { IRCClientInterface } from '../types';

const host = 'irc.freenode.net';
const port = 6667;
const nickName1 = 'Client1',
  nickName2 = 'Client2';
const fullName1 = 'Client1 Full Name',
  fullName2 = 'Client2 Full Name';
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

describe('Testing two clients joining a channel', () => {
  let client1: IRCClientInterface;
  let client2: IRCClientInterface;

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

  it('Client1 should be able to change its nickName', (done) => {
    const newNickName1 = 'MJ2';

    client2.on('NICK', (previousNickName, newNickName) => {
      expect(previousNickName).toBe(nickName1);
      expect(newNickName).toBe(newNickName1);
      done();
    });

    client1.nick(newNickName1).then(() => {
      expect(client1.nickName).toBe(newNickName1);
      expect(client2.nickName).toBe(nickName2);
    });
  }, 10000);

  it('Both clients should be able to communicate on a channel', (done) => {
    const msg1 = 'Hi there client1';
    const msg2 = 'Hi there client2';

    client1.on('PRIVMSG', (prefix, msgTarget, text) => {
      if (prefix.nickName === client2.nickName) {
        expect(text).toBe(msg2);
        done();
      }
    });

    client2.on('PRIVMSG', (prefix, msgTarget, text) => {
      if (prefix.nickName === client1.nickName) {
        expect(text).toBe(msg1);
      }
    });

    client1.privateMessage(channel, msg1);
    client2.privateMessage(channel, msg2);
  });

  afterAll(async () => {
    await Promise.all([client1.disconnect(), client2.disconnect()]);
  });
});
