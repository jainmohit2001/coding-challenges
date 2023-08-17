import { createLogger, format, transports } from 'winston';
import IRCClient from '../../src/16/irc-client';
import { IRCParser } from '../../src/16/parser';
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

describe('Testing IRC Parser', () => {
  const validInputs = [
    ':*.freenode.net 002 CCIRC :Your host is *.freenode.net, running version InspIRCd-3',
    ':.freenode.net NOTICE * :* Looking up your ident',
    ':.freenode.net NOTICE *:* :* Looking up your ident',
    ':*.freenode.net 353 CCIRC = #cc :@CCIRC',
    ':*.freenode.net 353 CCIRC = #cc :@CCIRC\r\n',
    ':*.freenode.net NOTICE CCIRC :*** Ident lookup timed out, using ~guest instead.',
    ':CCIRC!~guest@freenode-kge.qup.pic9tt.IP MODE CCIRC :+wRix',
    ':CCIRC!~guest@freenode-kge.qup.pic9tt.IP JOIN :#cc',
    ':CCIRC!~guest@freenode-kge.qup.pic9tt.IP PART :#cc',
    ':Guest4454!~guest@freenode-kge.qup.pic9tt.IP NICK :JohnC',
    ':JohnC!~JohnC@freenode-kge.qup.pic9tt.IP PRIVMSG #cc :Hi There!',
    ':*.freenode.net 002 CCIRC',
    ':*.freenode.net 005 MJ EXTBAN=,ACNOQRSTUacjmnpruwz HOSTLEN=64 INVEX=I KEYLEN=32 KICKLEN=255 LINELEN=512 MAXLIST=I:100,X:100,b:100,e:100,w:100 MAXTARGETS=20 MODES=20 MONITOR=30 NAMELEN=128 NAMESX NETWORK=freenode :are supported by this server'
  ];

  validInputs.forEach((input) => {
    it(`Should parse successfully,input - ${input}`, () => {
      expect(() => {
        new IRCParser(input).parse();
      }).not.toThrow();
    });
  });

  const invalidInputs = [
    ':*.freenode.net 002 CCIRC :Your host is *.freenode.net, running version InspIRCd-3\r\n1',
    ':*.freenode.net 00A CCIRC :Your host is *.freenode.net, running version InspIRCd-3',
    ':*.freenode.net A02 CCIRC :Your host is *.freenode.net, running version InspIRCd-3',
    ':.freenode.net NOTICE *\r :* Looking up your ident',
    ':*.freenode.net '
  ];

  invalidInputs.forEach((input) => {
    it(`Should throw error,input - ${input}`, () => {
      expect(() => {
        new IRCParser(input).parse();
      }).toThrow();
    });
  });
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
