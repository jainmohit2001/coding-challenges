// https://datatracker.ietf.org/doc/html/rfc2812#section-2.3.1

import { IPrefix, IRCMessage, IRCParserInterface } from './types';
import { getParamWithoutSemiColon } from './utils';

const SPACE = ' ';
const DISALLOWED_CHARS = '\x00\r\n :';
const CRLF = '\r\n';

class Prefix implements IPrefix {
  serverName?: string;
  nickName?: string;
  user?: string;
  host?: string;

  constructor(prefix?: string) {
    let serverName, nickName, host, user;

    if (prefix !== undefined) {
      prefix = getParamWithoutSemiColon(prefix);
      // If host is present in prefix
      if (prefix.indexOf('@') >= 0) {
        // Split the prefix
        const prefixArr = prefix.split('@');

        // Since no "@" is allowed expect for the case when host is present,
        // the second element will always be the host.
        host = prefixArr[1];

        // If nickName and user both are present
        if (prefixArr[0].indexOf('!') >= 0) {
          [nickName, user] = prefixArr[0].split('!');
        }
        // Only nickName is present
        else {
          nickName = prefixArr[0];
        }
      }
      // Otherwise only serverName is present
      else {
        serverName = prefix;
      }
    }

    this.serverName = serverName;
    this.nickName = nickName;
    this.host = host;
    this.user = user;
  }
}

export class IRCParser implements IRCParserInterface {
  private input: string;
  private pos: number;
  private inputLength;

  constructor(input: string) {
    // Support for input having CRLF at the end
    const lastTwoChars = input.substring(input.length - 2, input.length);
    if (lastTwoChars === CRLF) {
      input = input.substring(0, input.length - 2);
    }
    this.input = input;
    this.pos = 0;
    this.inputLength = this.input.length;
  }

  parse(): IRCMessage {
    let prefix;
    let command = '';
    let params: string[] = [];

    // If prefix is present than the input will start with ":"
    if (this.input[0] === ':') {
      this.consumeToken(':');
      prefix = this.parsePrefix();
      this.consumeToken(SPACE);
    }

    command = this.parseCommand();

    // Parse params if the current token is SPACE
    if (this.getCurrentToken() === SPACE) {
      params = this.parseParams();
    }

    // If we still have some characters left after parsing
    if (this.pos < this.inputLength) {
      throw new Error(`Invalid token ${this.getCurrentToken()} at ${this.pos}`);
    }

    return { command, params, prefix };
  }

  /**
   * Check if the middle and trailing part of params have valid characters:
   * Any octet except NUL, CR, LF, " " and ":"
   *
   * @private
   * @param {string} char
   * @returns {boolean}
   */
  private isNoSpaceCrLfCl(char: string): boolean {
    return !DISALLOWED_CHARS.includes(char);
  }

  private parseTrailing(): string {
    let str = '';

    while (this.pos < this.inputLength) {
      const token = this.getCurrentToken();

      if (token === ':' || token === ' ') {
        str += token;
        this.consumeToken();
        continue;
      }

      if (!this.isNoSpaceCrLfCl(token)) {
        throw new Error(`Invalid token ${token} at ${this.pos}`);
      }

      str += token;
      this.consumeToken();
    }
    return str;
  }

  private parseMiddle(): string {
    let str = '';

    let token = this.getCurrentToken();
    if (!this.isNoSpaceCrLfCl(token)) {
      throw new Error(`Invalid token ${token} at ${this.pos}`);
    }

    while (this.pos < this.inputLength) {
      token = this.getCurrentToken();

      if (token === ' ') {
        break;
      }

      if (token === ':') {
        str += token;
        this.consumeToken();
        continue;
      }

      if (!this.isNoSpaceCrLfCl(token)) {
        throw new Error(`Invalid token ${token} at ${this.pos}`);
      }

      str += token;
      this.consumeToken();
    }
    return str;
  }

  private parseParams(): string[] {
    const params: string[] = [];

    this.consumeToken(SPACE);

    // A maximum of 14 spaces allowed
    let spacesEncountered = 1;

    // The total length of params cannot exceed 15.
    while (
      this.pos < this.inputLength &&
      params.length <= 15 &&
      spacesEncountered <= 15
    ) {
      const token = this.getCurrentToken();

      // Condition if check if we have reached the trialing part
      if (token === ':' || params.length === 14) {
        const trailing = this.parseTrailing();
        params.push(trailing);
        break;
      }

      // Otherwise parse middle
      const middle = this.parseMiddle();
      params.push(middle);

      // Consume space if available
      if (this.getCurrentToken() === SPACE) {
        spacesEncountered++;
        this.consumeToken(SPACE);
      }
    }

    return params;
  }

  private parsePrefix(): IPrefix {
    let str = '';

    while (this.getCurrentToken() !== SPACE) {
      str += this.consumeToken();
    }

    return new Prefix(str);
  }

  /**
   * Parsed the Command if it contains 3 digits.
   *
   * @private
   * @returns {string}
   */
  private parseCommandDigit(): string {
    let str = '';

    for (let i = 0; i < 3; i++) {
      const token = this.getCurrentToken();

      if (!(token >= '0' && token <= '9')) {
        throw new Error(`Invalid token ${token} at ${this.pos}`);
      }

      str += token;
      this.consumeToken();
    }
    return str;
  }

  private parseCommand(): string {
    const token = this.getCurrentToken();

    // Check if numeric command is present
    if (token >= '0' && token <= '9') {
      return this.parseCommandDigit();
    }

    let str = '';

    // Parse a valid alpha-command
    while (this.pos < this.inputLength) {
      const token = this.getCurrentToken();

      if (token === SPACE) {
        break;
      }

      if ((token >= 'a' && token <= 'z') || (token >= 'A' && token <= 'Z')) {
        str += token;
        this.consumeToken();
      } else {
        throw new Error(`Invalid token ${token} at ${this.pos}`);
      }
    }

    if (str.length === 0) {
      throw new Error('No command found');
    }

    return str;
  }

  private consumeToken(char?: string): string {
    const token = this.getCurrentToken();

    // If char is provided ,check if the current token is same as char.
    if (char !== undefined) {
      if (token !== char) {
        throw new Error(
          `Invalid token ${token} at pos ${this.pos}. Expected ${char}`
        );
      }
    }

    this.pos++;
    return token;
  }

  private getCurrentToken() {
    return this.input[this.pos];
  }
}
