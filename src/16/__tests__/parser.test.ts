import { IRCParser } from '../parser';

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
    ':*.freenode.net 403 MJ  #cc Bye Bye :No such channel',
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
