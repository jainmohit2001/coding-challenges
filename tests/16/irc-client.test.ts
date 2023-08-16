import { createLogger, format, transports } from 'winston';
import IRCClient from '../../src/16/irc-client';
import { IRCParser } from '../../src/16/parser';
import path from 'path';

const logger = createLogger({
  transports: [
    new transports.File({
      dirname: path.join(process.cwd(), 'logs'),
      filename: 'irc_client.test.log'
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
    ':*.freenode.net 002 CCIRC'
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

describe('Testing IRC Client', () => {
  const host = 'irc.freenode.net';
  const port = 6667;
  const nickName = 'MJ';
  const fullName = 'Mohit Jain';
  let client: IRCClient;

  afterEach(async () => {
    await client.disconnect();
  });

  it('Should connect to server successfully', async () => {
    client = new IRCClient(host, port, nickName, fullName, true, logger);
    await client.connect();
    expect(client.connected).toBe(true);
  });
});
