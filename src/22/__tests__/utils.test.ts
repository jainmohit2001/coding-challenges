import { ClassValues, TypeValues } from '../enums';
import { IDnsHeader, IQuestion, IResourceRecord } from '../types';
import {
  convertHeaderToByteString,
  convertQuestionsToByteString,
  convertResourceRecordToByteString,
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
  it('should parse domain string to bytes correctly', () => {
    const domain = 'dns.google.com';
    const expectedOutput = '03646e7306676f6f676c6503636f6d00';
    expect(parseDomainToByteString(domain)).toBe(expectedOutput);
  });

  it('should parse domain to byte string correctly', () => {
    const domain = '192.35.51.30';
    const expectedOutput = '04c023331e';
    expect(parseDomainToByteString(domain, true)).toBe(expectedOutput);
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

describe(`Testing ${convertResourceRecordToByteString.name}`, () => {
  it('should convert NS records to a valid byte string successfully', () => {
    const records: IResourceRecord[] = [
      {
        name: 'com',
        type: 2,
        class: 1,
        ttl: 172800,
        dataLength: 20,
        data: 'e.gtld-servers.net'
      }
    ];
    const expectedOutput = [
      '03636f6d00',
      '0002',
      '0001',
      '0002a300',
      '0014',
      '01650c67746c642d73657276657273036e657400'
    ].join('');
    expect(convertResourceRecordToByteString(records)).toBe(expectedOutput);
  });

  it('should convert A records to a valid byte string successfully', () => {
    const records: IResourceRecord[] = [
      {
        name: 'dns.google.com',
        type: 1,
        class: 1,
        ttl: 747,
        dataLength: 4,
        data: '8.8.8.8'
      }
    ];
    const expectedOutput = [
      '03646e7306676f6f676c6503636f6d00',
      '0001',
      '0001',
      '000002eb',
      '0004',
      '0408080808'
    ].join('');
    expect(convertResourceRecordToByteString(records)).toBe(expectedOutput);
  });
});
