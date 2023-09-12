import { DnsMessage } from './dns_message';
import { ClassValues, QClassValues, QTypeValues, TypeValues } from './enums';
import {
  IDnsHeader,
  IDnsMessage,
  IDnsMessageParser,
  IQuestion,
  IResourceRecord
} from './types';

export default class DnsMessageParser implements IDnsMessageParser {
  private input: string;
  private pos: number;
  private inputLength: number;
  /**
   * This variable stores the octet index and the corresponding label.
   *
   * @private
   * @type {Map<number, string>}
   */
  private domainLabels: Map<number, string>;

  constructor(buffer: Buffer) {
    this.input = buffer.toString('hex');
    this.pos = 0;
    this.inputLength = this.input.length;
    this.domainLabels = new Map<number, string>();
  }
  parse(): IDnsMessage {
    const header = this.parseHeader();
    const questions = this.parseQuestions(header.qdCount);
    const answers = this.parseResourceRecords(header.anCount);
    const authority = this.parseResourceRecords(header.nsCount);
    const additional = this.parseResourceRecords(header.arCount);

    return new DnsMessage({
      header: header,
      questions: questions,
      answers: answers,
      authority: authority,
      additional: additional
    });
  }

  private parseHeader(): IDnsHeader {
    const id: number = parseInt(this.consumeToken(4), 16);

    const flags: number = parseInt(this.consumeToken(4), 16);
    const qr: number = ((0b1 << 15) & flags) >> 15,
      opcode: number = ((0b1111 << 11) & flags) >> 11,
      aa: number = ((0b1 << 10) & flags) >> 10,
      tc: number = ((0b1 << 9) & flags) >> 9,
      rd: number = ((0b1 << 8) & flags) >> 8,
      ra: number = ((0b1 << 7) & flags) >> 7,
      z: number = ((0b111 << 4) & flags) >> 4,
      rCode: number = 0b1111 & flags;

    const qdCount = parseInt(this.consumeToken(4), 16);
    const anCount = parseInt(this.consumeToken(4), 16);
    const nsCount = parseInt(this.consumeToken(4), 16);
    const arCount = parseInt(this.consumeToken(4), 16);

    const header: IDnsHeader = {
      id,
      qr,
      opcode,
      aa,
      tc,
      rd,
      ra,
      z,
      rCode,
      qdCount,
      anCount,
      nsCount,
      arCount
    };

    return header;
  }

  private parseDomain(): string {
    const labels: string[] = [];
    const offsets: number[] = [];

    while (this.pos < this.inputLength) {
      // Since we are working with hex string
      // the octet offset will be: position / 2
      const offset = this.pos / 2;

      // The first octet
      const length = parseInt(this.consumeToken(2), 16);

      // End of domain, null label
      if (length === 0) {
        break;
      }

      // If pointer format, then the first two bits are ones
      if (((0b11 << 6) & length) > 0) {
        // Move the position 1 octet back
        this.pos -= 2;

        // Retrieve the offset value
        // +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
        // | 1  1|                OFFSET                   |
        // +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
        const octetOffset = 0x3fff & parseInt(this.consumeToken(4), 16);

        // Get the corresponding label
        const domainLabel = this.domainLabels.get(octetOffset);
        if (domainLabel === undefined) {
          throw new Error(`Invalid offset provided at ${this.pos}`);
        }

        // Skip setting the domainLabels map
        offsets.push(-1);

        // End of this domain parsing
        labels.push(domainLabel);
        break;
      }

      // Retrieve the next `length` octets
      let label = '';
      let i = 0;
      while (i < length) {
        label += Buffer.from(this.consumeToken(2), 'hex').toString('utf-8');
        i++;
      }
      offsets.push(offset);
      labels.push(label);
    }

    // We are using the offsets and labels array to memoize the domainLabels.
    // We start iterating from the back (offsets.length - 1),
    // and move towards the start (0).
    let i = offsets.length - 1;
    let label = labels[i];
    if (offsets[i] >= 0) {
      this.domainLabels.set(offsets[i], label);
    }
    i--;

    for (i; i >= 0; i--) {
      label = labels[i] + '.' + label;
      if (offsets[i] >= 0) {
        this.domainLabels.set(offsets[i], label);
      }
    }

    return label;
  }

  private parseQuestions(count: number): IQuestion[] {
    const questions = new Array<IQuestion>(count);

    for (let i = 0; i < count; i++) {
      const qName = this.parseDomain();
      const qType: TypeValues | QTypeValues = parseInt(
        this.consumeToken(4),
        16
      );
      const qClass: ClassValues | QClassValues = parseInt(
        this.consumeToken(4),
        16
      );

      const obj: IQuestion = { name: qName, type: qType, class: qClass };
      questions[i] = obj;
    }

    return questions;
  }

  /**
   * Convert the byte string format of the RDATA field of Resource Records
   * into a human readable data structure.
   *
   * The function currently supports A record and NS record parsing.
   * Currently the fallback mechanism is set to byte string.
   *
   * @private
   * @param {TypeValues} rrType
   * @param {ClassValues} rrClass
   * @param {number} dataLength
   * @returns {string}
   */
  private parseRRData(
    rrType: TypeValues,
    rrClass: ClassValues,
    dataLength: number
  ): string {
    // Refer to https://datatracker.ietf.org/doc/html/rfc1035#section-3.4.1
    // A record contains the domain.
    // Example: 8.8.8.8
    if (rrType === TypeValues.A && rrClass === ClassValues.IN) {
      const data: string[] = [];

      for (let i = 0; i < dataLength; i++) {
        data.push(parseInt(this.consumeToken(2), 16).toString());
      }
      return data.join('.');
    }

    // Refer to https://datatracker.ietf.org/doc/html/rfc1035#section-3.3.11
    // NS record contains a domain string
    // Example: dns.google.com
    if (rrType === TypeValues.NS) {
      return this.parseDomain();
    }

    return this.consumeToken(dataLength * 2);
  }

  private parseResourceRecords(count: number): IResourceRecord[] {
    const arr = new Array<IResourceRecord>(count);

    for (let i = 0; i < count; i++) {
      const rrName = this.parseDomain();
      const rrType: TypeValues = parseInt(this.consumeToken(4), 16);
      const rrClass: ClassValues = parseInt(this.consumeToken(4), 16);
      const ttl = parseInt(this.consumeToken(8), 16);
      const dataLength = parseInt(this.consumeToken(4), 16);
      const data = this.parseRRData(rrType, rrClass, dataLength);

      const rr: IResourceRecord = {
        name: rrName,
        type: rrType,
        class: rrClass,
        ttl,
        dataLength,
        data
      };

      arr[i] = rr;
    }

    return arr;
  }

  /**
   * Consumes tokens and increment the pointer pos.
   *
   * @private
   * @param {number} length
   * @param {?string} [str]
   * @returns {string}
   */
  private consumeToken(length: number, str?: string): string {
    const token = this.getCurrentToken(length);

    if (str && token !== str) {
      throw new Error(`Invalid token ${token} at ${this.pos}. Expected ${str}`);
    }

    this.pos += length;
    return token;
  }

  private getCurrentToken(length: number): string {
    return this.input.substring(this.pos, this.pos + length);
  }
}
