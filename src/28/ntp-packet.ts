import { NTP_VERSION, POW_2_32 } from './constants';

// Offsets in packet
const REFERENCE_TIMESTAMP_OFFSET = 16;
const ORIGIN_TIMESTAMP_OFFSET = 24;
const RECEIVE_TIMESTAMP_OFFSET = 32;
const TRANSMIT_TIMESTAMP_OFFSET = 40;

// Reference date used in RFC5905
const REF_DATE = new Date('Jan 01 1900 GMT');

/**
 * View the following link for more details:
 * https://datatracker.ietf.org/doc/html/rfc5905#section-7.3
 *
 * @export
 */
export type NtpPacket = {
  leap: number;
  version: number;
  mode: number;

  reftime: Date;
  org: Date;
  rec: Date;
  xmt: Date;
  dst: Date;
};

/**
 * This function creates a NTP request packet with following params:
 * - leap = 3
 * - mode = 3
 * - version = 4
 *
 * @export
 * @returns {Buffer}
 */
export function createNtpPacket(): Buffer {
  const leap = 3;
  const mode = 3;

  const packet = Buffer.alloc(48, 0);

  packet[0] = mode ^ (NTP_VERSION << 3) ^ (leap << 6);

  const originTimestampInSec =
    (new Date().getTime() - REF_DATE.getTime()) / 1000;
  const ntpOriginTimestamp = BigInt(originTimestampInSec * POW_2_32);
  packet.writeBigUInt64BE(ntpOriginTimestamp, ORIGIN_TIMESTAMP_OFFSET);

  packet.writeBigUInt64BE(ntpOriginTimestamp, TRANSMIT_TIMESTAMP_OFFSET);

  return packet;
}

/**
 * Returns a Date object given a NTP timestamp.
 *
 * @export
 * @param {Buffer} buffer
 * @returns {Date}
 */
export function parseTimestamp(buffer: Buffer): Date {
  const seconds = parseInt(buffer.readBigUInt64BE().toString(10)) / POW_2_32;
  const date = new Date('Jan 01 1900 GMT');
  date.setUTCMilliseconds(date.getUTCMilliseconds() + seconds * 1000);
  return date;
}

/**
 * This function parses the reply received over socket for a NTP request.
 *
 * @export
 * @param {Buffer} buffer
 * @returns {NtpPacket}
 */
export function parseNtpPacket(buffer: Buffer): NtpPacket {
  const dst = new Date();
  const leap = (buffer[0] & 0b11000000) >> 6;
  const version = (buffer[0] & 0b00111000) >> 3;
  const mode = buffer[0] & 0b111;

  const reftime = parseTimestamp(
    buffer.subarray(REFERENCE_TIMESTAMP_OFFSET, REFERENCE_TIMESTAMP_OFFSET + 8)
  );

  const org = parseTimestamp(
    buffer.subarray(ORIGIN_TIMESTAMP_OFFSET, ORIGIN_TIMESTAMP_OFFSET + 8)
  );

  const rec = parseTimestamp(
    buffer.subarray(RECEIVE_TIMESTAMP_OFFSET, RECEIVE_TIMESTAMP_OFFSET + 8)
  );

  const xmt = parseTimestamp(
    buffer.subarray(TRANSMIT_TIMESTAMP_OFFSET, TRANSMIT_TIMESTAMP_OFFSET + 8)
  );

  return { leap, version, mode, reftime, org, rec, xmt, dst };
}

/**
 * Calculate the offset in ms given a NTP reply Packet.
 *
 * @export
 * @param {NtpPacket} msg
 * @returns {number} offset in ms
 */
export function calculateOffset(msg: NtpPacket): number {
  return (
    (msg.rec.getTime() -
      msg.org.getTime() +
      msg.xmt.getTime() -
      msg.dst.getTime()) /
    2
  );
}

/**
 * Calculate the RTT in ms given a NTP reply packet.
 *
 * @export
 * @param {NtpPacket} msg
 * @returns {number} RTT in ms
 */
export function calculateRoundTripDelay(msg: NtpPacket): number {
  return (
    msg.dst.getTime() -
    msg.org.getTime() -
    msg.xmt.getTime() +
    msg.rec.getTime()
  );
}
