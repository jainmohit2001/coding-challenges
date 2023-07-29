import { RespArray, RespType } from './types';

interface IRedisDeserializer {
  parse(): RespType;
}

export class RedisDeserializer implements IRedisDeserializer {
  private input: string;
  private pos: number;
  private inputLength: number;

  constructor(input: string) {
    this.input = input;
    this.pos = 0;
    this.inputLength = input.length;
  }

  parse(): RespType {
    const output = this.parseValue();

    if (this.hasNext()) {
      throw new Error(`Invalid token ${this.getCurrentToken()} at ${this.pos}`);
    }

    return output;
  }

  parseValue(): RespType {
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

  private hasNext(): boolean {
    return this.input.codePointAt(this.pos) !== undefined;
  }

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

  private getCurrentToken() {
    return this.input[this.pos];
  }
}
