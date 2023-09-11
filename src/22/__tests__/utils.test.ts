import DnsResolver from '../dns_resolver';
import { ClassValues, TypeValues } from '../enums';
import { IDnsHeader, IQuestion } from '../types';
import {
  convertHeaderToByteString,
  convertQuestionsToByteString,
  parseDomainToByteString
} from '../utils';

describe(`Testing ${convertHeaderToByteString.name}`, () => {
  it('should convert header to byte string correctly', () => {
    const header: IDnsHeader = {
      id: 22,
      qr: 0b0,
      opcode: 0b0000,
      aa: 0b0,
      tc: 0b0,
      rd: 0b1,
      ra: 0b0,
      z: 0b000,
      rCode: 0b0000,
      anCount: 0x0000,
      arCount: 0x0000,
      nsCount: 0x0000,
      qdCount: 0x0001
    };

    const expectedOutput = '001601000001000000000000';
    expect(convertHeaderToByteString(header)).toBe(expectedOutput);
  });
});

describe(`Testing ${parseDomainToByteString.name}`, () => {
  it('should parse domain to bytes correctly', () => {
    const domain = 'dns.google.com';
    const expectedOutput = '03646e7306676f6f676c6503636f6d00';
    expect(parseDomainToByteString(domain)).toBe(expectedOutput);
  });
});

describe(`Testing ${convertQuestionsToByteString.name}`, () => {
  it('should convert question to a byte string successfully', () => {
    const question: IQuestion = {
      name: 'dns.google.com',
      type: TypeValues.A,
      class: ClassValues.IN
    };
    const expectedOutput = '03646e7306676f6f676c6503636f6d0000010001';
    expect(convertQuestionsToByteString([question])).toBe(expectedOutput);
  });
});

describe('Testing dns resolver', () => {
  const host = '8.8.8.8';
  const port = 53;
  const domain = 'dns.google.com';
  let client: DnsResolver;

  beforeAll(() => {
    client = new DnsResolver(domain, host, port, false);
  });

  afterAll(() => {
    client.close();
  });

  it('should send and receive message with same id', async () => {
    const response = await client.sendMessage();
    expect(response.length).toBeGreaterThan(0);
  });
});
