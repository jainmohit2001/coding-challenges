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

interface IResourceRecord {
  /**
   * Domain name.
   *
   * @type {string}
   */
  name: string;

  /**
   * Type of Resource Record.
   * 16 bit integer.
   *
   * @type {TypeValues}
   */
  type: TypeValues;

  /**
   * Class of the data present in this RR.
   * 16 bit integer.
   *
   * @type {ClassValues}
   */
  class: ClassValues;

  /**
   * Time interval (in seconds) that the RR may be cached,
   * before it should be discarded.
   * A 32 bit unsigned integer.
   *
   * @type {number}
   */
  ttl: number;

  /**
   * Length in octets of the data field.
   * An unsigned 16 bit integer.
   *
   * @type {number}
   */
  dataLength: number;

  /**
   * Variable length string of octets that describes the record.
   *
   * @type {string}
   */
  data: string;
}

interface IDnsMessage {
  header: IDnsHeader;
  questions: IQuestion[];
  answers: IResourceRecord[];
  authority: IResourceRecord[];
  additional: IResourceRecord[];
  toByteString(): string;
}

interface IDnsMessageParser {
  parse(): IDnsMessage;
}

interface IDnsResolver {
  domain: string;
  host: string;
  port: number;
  debug: boolean;
  close(): void;
  sendMessage(): Promise<IDnsMessage>;
}

interface ICommandWaitingForReply {
  resolve(reply?: IDnsMessage | PromiseLike<IDnsMessage>): void;
  reject(reply?: unknown): void;
}

export {
  IDnsHeader,
  IDnsMessage,
  IDnsMessageParser,
  IQuestion,
  IDnsResolver,
  ICommandWaitingForReply,
  IResourceRecord
};
