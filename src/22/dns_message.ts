import { randomBytes } from 'crypto';
import { IDnsHeader, IDnsMessage, IQuestion } from './types';
import { ClassValues, TypeValues } from './enums';
import {
  convertHeaderToByteString,
  convertQuestionsToByteString
} from './utils';

class DnsMessage implements IDnsMessage {
  header: IDnsHeader;
  questions: IQuestion[];
  private domain: string;

  constructor(domain: string) {
    this.header = {
      id: parseInt(randomBytes(2).toString('hex'), 16),
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

    this.domain = domain;

    this.questions = [
      {
        name: domain,
        type: TypeValues.A,
        class: ClassValues.IN
      }
    ];
  }
  toByteString(): string {
    return (
      convertHeaderToByteString(this.header) +
      convertQuestionsToByteString(this.questions)
    );
  }
}

export { DnsMessage };
