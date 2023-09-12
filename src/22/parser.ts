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
      const offset = this.pos / 2;
      const length = parseInt(this.consumeToken(2), 16);

      if (length === 0) {
        break;
      }
      offsets.push(offset);

      // Pointer format, the first two bits are ones
      if (((0b11 << 6) & length) > 0) {
        const octetOffset =
          0x3fff & ((length << 8) + parseInt(this.consumeToken(2), 16));
        return this.domainLabels.get(octetOffset)!;
      }

      let label = '';
      let i = 0;
      while (i < length) {
        label += Buffer.from(this.consumeToken(2), 'hex').toString('utf-8');
        i++;
      }
      labels.push(label);
    }

    let i = offsets.length - 1;
    let label = labels[i];
    this.domainLabels.set(offsets[i], label);
    i--;

    for (i; i >= 0; i--) {
      label = labels[i] + '.' + label;
      this.domainLabels.set(offsets[i], label);
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

  private parseResourceRecords(count: number): IResourceRecord[] {
    const arr = new Array<IResourceRecord>(count);

    for (let i = 0; i < count; i++) {
      const rrName = this.parseDomain();
      const rrType: TypeValues = parseInt(this.consumeToken(4), 16);
      const rrClass: ClassValues = parseInt(this.consumeToken(4), 16);
      const ttl = parseInt(this.consumeToken(8), 16);
      const dataLength = parseInt(this.consumeToken(4), 16);
      const data = this.consumeToken(dataLength * 2);

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

  private consumeToken(length: number, char?: string): string {
    const token = this.getCurrentToken(length);

    if (char && token !== char) {
      throw new Error(
        `Invalid token ${token} at ${this.pos}. Expected ${char}`
      );
    }

    this.pos += length;
    return token;
  }

  private getCurrentToken(length: number): string {
    return this.input.substring(this.pos, this.pos + length);
  }
}
