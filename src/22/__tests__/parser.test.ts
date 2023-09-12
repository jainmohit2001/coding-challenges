import { DnsMessage } from '../dns_message';
import DnsMessageParser from '../parser';
import { IDnsMessage } from '../types';

describe('Testing DNS message parser', () => {
  it('should parse a dns request message successfully', () => {
    const hexMessage =
      '00160100000100000000000003646e7306676f6f676c6503636f6d0000010001';

    const expectedMessage: IDnsMessage = new DnsMessage({
      header: {
        id: 22,
        qr: 0,
        opcode: 0,
        aa: 0,
        tc: 0,
        rd: 1,
        ra: 0,
        z: 0,
        rCode: 0,
        anCount: 0,
        arCount: 0,
        nsCount: 0,
        qdCount: 1
      },
      questions: [
        {
          name: 'dns.google.com',
          class: 1,
          type: 1
        }
      ]
    });

    expect(
      new DnsMessageParser(Buffer.from(hexMessage, 'hex')).parse()
    ).toStrictEqual(expectedMessage);
  });

  it('should parse dns message from server successfully', () => {
    const hexMessage =
      'beaf8180000100020000000003646e7306676f6f676c6503636f6d0000010001c00c0001000100000366000408080808c00c0001000100000366000408080404';

    const expectedMessage: IDnsMessage = new DnsMessage({
      header: {
        id: 48815,
        qr: 1,
        opcode: 0,
        aa: 0,
        tc: 0,
        rd: 1,
        ra: 1,
        z: 0,
        rCode: 0,
        qdCount: 1,
        anCount: 2,
        nsCount: 0,
        arCount: 0
      },
      questions: [{ name: 'dns.google.com', type: 1, class: 1 }],
      answers: [
        {
          name: 'dns.google.com',
          type: 1,
          class: 1,
          ttl: 870,
          dataLength: 4,
          data: '8.8.8.8'
        },
        {
          name: 'dns.google.com',
          type: 1,
          class: 1,
          ttl: 870,
          dataLength: 4,
          data: '8.8.4.4'
        }
      ]
    });

    expect(
      new DnsMessageParser(Buffer.from(hexMessage, 'hex')).parse()
    ).toStrictEqual(expectedMessage);
  });
});
