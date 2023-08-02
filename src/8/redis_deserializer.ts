import { RespArray, RespType } from './types';

export interface IRedisDeserializer {
  /**
   * This function parses the text input.
   * It also raises Error if the input is invalid.
   *
   * @returns {RespType}
   */
  parse(): RespType;

  /**
   * Returns the current position of the cursor while traversing the input.
   *
   * @returns {number}
   */
  getPos(): number;
}

export class RedisDeserializer implements IRedisDeserializer {
  private input: string;
  private pos: number;
  private inputLength: number;
  private multipleCommands: boolean;

  constructor(input: string, multipleCommands: boolean = false) {
    this.input = input;
    this.pos = 0;
    this.inputLength = input.length;
    this.multipleCommands = multipleCommands;
  }

  getPos(): number {
    return this.pos;
  }

  parse(): RespType {
    const output = this.parseValue();

    // If the input text still has characters
    if (this.hasNext() && !this.multipleCommands) {
      throw new Error(
        `Invalid token ${JSON.stringify(this.getCurrentToken())} at ${this.pos}`
      );
    }

    return output;
  }

  /**
   * This function parses a single value, which can be:
   *    Simple String
   *    Error
   *    Integer
   *    Bulk String
   *    Arrays
   *
   * @private
   * @returns {RespType}
   */
  private parseValue(): RespType {
    const token = this.getCurrentToken();
    switch (token) {
      case '+':
        return this.parseSimpleStrings();
      case '-':
        return this.parseError();
      case ':':
        return this.parseInteger();
      case '$':
        return this.parseBulkStrings();
      case '*':
        return this.parseArrays();
      default:
        throw new Error(`Invalid token ${token} at ${this.pos}`);
    }
  }

  /**
   * Checks whether this is end point input or not
   *
   * @private
   * @returns {boolean}
   */
  private hasNext(): boolean {
    return this.input.codePointAt(this.pos) !== undefined;
  }

  /**
   * Parses an Error
   *  e.g. - "-Error Message\r\n"
   *
   * @private
   * @returns {Error}
   */
  private parseError(): Error {
    this.consumeToken('-');

    let message = '';

    while (this.getCurrentToken() !== '\r' && this.pos < this.inputLength) {
      message += this.getCurrentToken();
      this.consumeToken();
    }

    this.consumeToken('\r');
    this.consumeToken('\n');

    return new Error(message);
  }

  /**
   * Parses an Integer
   *  e.g. - ":1000\r\n"
   *
   * @private
   * @returns {number}
   */
  private parseInteger(): number {
    this.consumeToken(':');

    let ans = 0;

    while (this.getCurrentToken() !== '\r' && this.pos < this.inputLength) {
      ans = ans * 10 + parseInt(this.getCurrentToken());
      this.consumeToken();
    }

    this.consumeToken('\r');
    this.consumeToken('\n');
    return ans;
  }

  /**
   * Parses a Simple string
   *  e.g - "+OK\r\n"
   *
   * @private
   * @returns {string}
   */
  private parseSimpleStrings(): string {
    this.consumeToken('+');

    let str = '';

    while (this.getCurrentToken() !== '\r' && this.pos < this.inputLength) {
      str += this.getCurrentToken();
      this.consumeToken();
    }

    this.consumeToken('\r');
    this.consumeToken('\n');
    return str;
  }

  /**
   * Parses a Bulk String
   *  e.g - "$5\r\nHello\r\n"
   *
   * @private
   * @returns {(string | null)}
   */
  private parseBulkStrings(): string | null {
    this.consumeToken('$');

    const length = this.getLength();
    if (length === -1) {
      return null;
    }

    let str = '';
    let i = 0;

    while (i < length && this.pos < this.inputLength) {
      str += this.getCurrentToken();
      this.consumeToken();
      i++;
    }

    this.consumeToken('\r');
    this.consumeToken('\n');
    return str;
  }

  /**
   * This function is used by the parseBulkStrings and parseArrays.
   * It parses the length/size provided for Bulk String or Array respectively.
   *
   * @private
   * @returns {number}
   */
  private getLength(): number {
    let ans = 0;

    if (this.getCurrentToken() === '-') {
      this.consumeToken('-');
      this.consumeToken('1');
      this.consumeToken('\r');
      this.consumeToken('\n');
      return -1;
    }

    while (this.pos < this.inputLength && this.getCurrentToken() !== '\r') {
      ans = ans * 10 + parseInt(this.getCurrentToken());
      this.consumeToken();
    }

    this.consumeToken('\r');
    this.consumeToken('\n');

    return ans;
  }

  /**
   * Parses an Array.
   * The elements of an Array can be:
   *    Simple String, Integer, Error, Bulk Strings or Arrays.
   *  e.g. - "*1\r\n+Hello\r\n"
   *
   * @private
   * @returns {RespArray}
   */
  private parseArrays(): RespArray {
    this.consumeToken('*');

    const arrayLength = this.getLength();

    if (arrayLength === -1) {
      return null;
    }

    if (arrayLength === 0) {
      return [];
    }

    const arr = new Array<RespType>(arrayLength);

    let i = 0;

    while (i < arrayLength) {
      if (this.pos >= this.inputLength) {
        throw new Error(
          `Index out of bounds ${this.pos} >= ${this.inputLength}`
        );
      }
      const elem = this.parseValue();
      arr[i] = elem;
      i++;
    }

    return arr;
  }

  /**
   * Consumes the given token if provided.
   * Increments the index.
   * @date 7/29/2023 - 6:59:12 PM
   *
   * @private
   * @param {?string} [token]
   */
  private consumeToken(token?: string) {
    if (token) {
      if (this.getCurrentToken() !== token) {
        throw new Error(
          `Invalid Token at ${this.pos}. Expected ${JSON.stringify(
            token
          )} but found ${JSON.stringify(this.getCurrentToken())}`
        );
      }
    }

    this.pos++;
  }

  /**
   * Returns the character the current index is pointing to in the input.
   *
   * @private
   * @returns {*}
   */
  private getCurrentToken() {
    return this.input[this.pos];
  }
}
