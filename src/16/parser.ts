// https://datatracker.ietf.org/doc/html/rfc2812#section-2.3.1

const SPACE = ' ';
const DISALLOWED_CHARS = '\x00\r\n :';
const CRLF = '\r\n';

export interface IRCMessage {
  /**
   * The command sent by the server.
   *
   * @type {string}
   */
  command: string;
  /**
   * This is a list of string used by server to pass various parameters.
   *
   * @type {string[]}
   */
  params: string[];
  /**
   * An optional prefix sent by the server
   *
   * @type {?string}
   */
  prefix?: string;
}

interface IRCParserInterface {
  /**
   * This function parses the input provided in the Parser.
   * It throw an error if the input provided is wrong otherwise
   * returns the parsed message.
   *
   * @returns {IRCMessage}
   */
  parse(): IRCMessage;
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
      spacesEncountered <= 14
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

  private parsePrefix(): string {
    let str = '';

    while (this.getCurrentToken() !== SPACE) {
      str += this.consumeToken();
    }

    return str;
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
