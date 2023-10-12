import { NTP_VERSION } from './constants';

// Offsets in packet
const ORIGIN_TIMESTAMP_OFFSET = 24;
const TRANSMIT_TIMESTAMP_OFFSET = 40;

// Reference date used in RFC5905
const REF_DATE = new Date('Jan 01 1900 GMT');

export interface NtpPacket {
  leap: number;
  version: number;
  mode: number;
}

export function createNtpPacket(): Buffer {
  const leap = 3;
  const mode = 3;

  const packet = Buffer.alloc(48, 0);

  packet[0] = mode ^ (NTP_VERSION << 3) ^ (leap << 6);

  const originTimestampInSec =
    (new Date().getTime() - REF_DATE.getTime()) / 1000;
  const ntpOriginTimestamp = BigInt(
    (originTimestampInSec * Math.pow(2, 32)).toString()
  );
  packet.writeBigUInt64BE(ntpOriginTimestamp, ORIGIN_TIMESTAMP_OFFSET);

  packet.writeBigUInt64BE(ntpOriginTimestamp, TRANSMIT_TIMESTAMP_OFFSET);

  return packet;
}

export function parseNtpPacket(buffer: Buffer): NtpPacket {
  const leap = (buffer[0] & 0b11000000) >> 6;
  const version = (buffer[0] & 0b00111000) >> 3;
  const mode = buffer[0] & 0b111;

  return { leap, version, mode };
}
