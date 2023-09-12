import { randomBytes } from 'crypto';
import { IDnsHeader, IDnsMessage, IQuestion, IResourceRecord } from './types';
import {
  convertHeaderToByteString,
  convertQuestionsToByteString,
  convertResourceRecordToByteString
} from './utils';

interface DnsMessageArgs {
  header?: IDnsHeader;
  questions?: IQuestion[];
  answers?: IResourceRecord[];
  authority?: IResourceRecord[];
  additional?: IResourceRecord[];
}

class DnsMessage implements IDnsMessage {
  header: IDnsHeader;
  questions: IQuestion[];
  answers: IResourceRecord[];
  authority: IResourceRecord[];
  additional: IResourceRecord[];

  constructor({
    header = undefined,
    questions = [],
    answers = [],
    authority = [],
    additional = []
  }: DnsMessageArgs) {
    if (header === undefined) {
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
    } else {
      this.header = header;
    }

    this.questions = questions;
    this.answers = answers;
    this.authority = authority;
    this.additional = additional;
  }
  toByteString(): string {
    return (
      convertHeaderToByteString(this.header) +
      convertQuestionsToByteString(this.questions) +
      convertResourceRecordToByteString(this.answers) +
      convertResourceRecordToByteString(this.authority) +
      convertResourceRecordToByteString(this.additional)
    );
  }
}

export { DnsMessage };
