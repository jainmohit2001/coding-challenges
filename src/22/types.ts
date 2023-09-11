import { ClassValues, QClassValues, QTypeValues, TypeValues } from './enums';

interface IDnsHeader {
  /**
   * A 16 bit identifier
   *
   * @type {number}
   */
  id: number;

  /**
   * A one bit field that specifies whether this message is a
   * query (0), or a response (1)
   *
   * @type {number}
   */
  qr: number;

  /**
   * A 4 bit field that specifies the kind of query in this message.
   * - `0`: a standard query (QUERY)
   * - `1`: an inverse query (IQUERY)
   * - `2`: a server status request (STATUS)
   * - `3-15`: reserved for future use
   *
   * @type {number}
   */
  opcode: number;

  /**
   * Authoritative Answer - one bit.
   *
   * @type {number}
   */
  aa: number;

  /**
   * TrunCation - one bit.
   *
   * @type {number}
   */
  tc: number;

  /**
   * Recursion Desired - one bit.
   *
   * @type {number}
   */
  rd: number;

  /**
   * Recursion Available - one bit.
   *
   * @type {number}
   */
  ra: number;

  /**
   * Reserved for future use.
   * Must be zero in all queries and responses.
   * 3 bits
   *
   * @type {number}
   */
  z: number;

  /**
   * Response code - 4 bit field
   * - `0`: No error condition
   * - `1`: Format error
   * - `2`: Server failure
   * - `3`: Name Error
   * - `4`: Not Implemented
   * - `5`: Refused
   * - `6-15`: Reserved for future use
   *
   * @type {number}
   */
  rCode: number;

  /**
   * Number of entries in the question section.
   * An unsigned 16 bit integer.
   *
   * @type {number}
   */
  qdCount: number;

  /**
   * Number of resource records in the answer section.
   * An unsigned 16 bit integer.
   *
   * @type {number}
   */
  anCount: number;

  /**
   * Number of name server resource records in the authority records section.
   * An unsigned 16 bit integer.
   *
   * @type {number}
   */
  nsCount: number;

  /**
   * Number of resource records in the additional records section.
   * An unsigned 16 bit integer.
   *
   * @type {number}
   */
  arCount: number;
}

interface IQuestion {
  /**
   * Domain name represented as a sequence of labels.
   * Each label consists of a length octet followed by that number of octets.
   * The domain name terminates with a zero length octet.
   * May have and odd number of octets. No padding is used.
   *
   * @type {string}
   */
  name: string;

  /**
   * A two octet code - specifies the type of query.
   *
   * @type {number}
   */
  type: TypeValues | QTypeValues;

  /**
   * A two octet code - specifies the class of the query.
   *
   * @type {number}
   */
  class: ClassValues | QClassValues;
}

interface IDnsMessage {
  header: IDnsHeader;
  questions: IQuestion[];
  toByteString(): string;
}

interface IDnsMessageParser {
  parse: (input: Buffer) => IDnsMessage;
}

interface IDnsResolver {
  domain: string;
  host: string;
  port: number;
  debug: boolean;
  close(): void;
  sendMessage(): Promise<Buffer>;
}

interface ICommandWaitingForReply {
  resolve(reply?: unknown): void;
  reject(reply?: unknown): void;
}

export {
  IDnsHeader,
  IDnsMessage,
  IDnsMessageParser,
  IQuestion,
  IDnsResolver,
  ICommandWaitingForReply
};
