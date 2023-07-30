import { RespArray } from './types';

export interface IRedisSerializer {
  /**
   * This function serializes a given object.
   * The object should be of a valid RESP Type, otherwise it throws an Error.
   *
   * @param {unknown} input
   * @param {boolean} useBulkString - Uses bulk strings to serialize instead of using simple strings
   * @returns {string}
   */
  serialize(input: unknown, useBulkString?: boolean): string;

  /**
   * This function is sued to serialize strings.
   * The strings can have any binary supported character.
   *
   * @param {(string | null)} input
   * @returns {string}
   */
  serializeBulkStrings(input: string | null): string;
}

/**
 * This function checks whether the input has a valid RESP Type.
 * If the input provided is a nested data structure, it recursively checks all the elements.
 * @date 7/29/2023 - 7:00:14 PM
 *
 * @param {unknown} input
 * @returns {boolean}
 */
function isARespType(input: unknown): boolean {
  const typeofInput = typeof input;

  // If the input is of type string, number, null, or Error.
  if (
    typeofInput === 'string' ||
    typeofInput === 'number' ||
    input === null ||
    input instanceof Error
  ) {
    return true;
  }

  // If the input is an Array.

  if (Array.isArray(input)) {
    let isValid = true;

    for (const elem in input) {
      // check wether each element is a valid RESP Type or not.
      isValid = isValid && isARespType(elem);
      if (!isValid) {
        return false;
      }
    }

    return isValid;
  }
  return false;
}

export class RedisSerializer implements IRedisSerializer {
  serialize(input: unknown, useBulkString?: boolean): string {
    if (input === null) {
      return this.serializeNull();
    } else if (typeof input === 'string') {
      if (useBulkString === true) {
        return this.serializeBulkStrings(input);
      }
      return this.serializeSimpleString(input);
    } else if (typeof input === 'number') {
      return this.serializeInteger(input);
    } else if (Array.isArray(input) && isARespType(input)) {
      return this.serializeArrays(input, useBulkString);
    } else if (input instanceof Error) {
      return this.serializerError(input);
    }
    throw new Error('Invalid input');
  }

  serializeBulkStrings(input: string): string {
    return `$${input.length}\r\n${input}\r\n`;
  }

  private serializerError(err: Error): string {
    return `-${err.message}\r\n`;
  }

  private serializeInteger(input: number): string {
    if (Math.floor(input) !== input) {
      throw new Error(`Invalid integer ${input}`);
    }
    return `:${input}\r\n`;
  }

  private serializeSimpleString(input: string): string {
    if (input.indexOf('\r') > 0 || input.indexOf('\n') > 0) {
      throw new Error('Simple string contains CR or LF character');
    }
    return '+' + input + '\r\n';
  }

  private serializeNull(): string {
    return '$-1\r\n';
  }

  private serializeArrays(input: RespArray, useBulkString?: boolean): string {
    if (input === null) {
      return '*-1\r\n';
    }
    let str = '*' + input.length + '\r\n';
    for (let i = 0; i < input.length; i++) {
      str += this.serialize(input[i], useBulkString);
    }
    return str;
  }
}
