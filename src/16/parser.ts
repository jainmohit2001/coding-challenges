const SPACE = ' ';

export interface IRCMessage {
  command: string;
  params: string[];
  prefix?: string;
}

interface IRCParserInterface {
  parse(): IRCMessage;
}

export class IRCParser implements IRCParserInterface {
  private input: string;
  private pos: number;
  private inputLength;

  constructor(input: string) {
    this.input = input;
    this.pos = 0;
    this.inputLength = this.input.length;
  }

  parse(): IRCMessage {
    let prefix;
    let command = '';
    let params: string[] = [];

    if (this.input[0] === ':') {
      this.consumeToken(':');
      prefix = this.parsePrefix();
      this.consumeToken(SPACE);
    }

    command = this.parseCommand();
    if (this.getCurrentToken() === SPACE) {
      params = this.parseParams();
    }
    return { command, params, prefix };
  }

  private parseParams(): string[] {
    const params: string[] = [];
    this.consumeToken(SPACE);
    // TODO: handle middle and trailing part
    return params;
  }

  private parsePrefix(): string {
    let str = '';

    while (this.getCurrentToken() !== SPACE) {
      str += this.consumeToken();
    }

    return str;
  }

  private parseCommandDigit(): string {
    let str = '';

    for (let i = 0; i < 3; i++) {
      const token = this.getCurrentToken();

      if (!(token > '0' && token < '9')) {
        throw new Error(`Invalid token ${token} at ${this.pos}`);
      }

      str += token;
      this.consumeToken();
    }
    return str;
  }

  private parseCommand(): string {
    const token = this.getCurrentToken();

    if (token > '0' && token < '9') {
      return this.parseCommandDigit();
    }

    let str = '';

    while (this.pos < this.inputLength) {
      const token = this.getCurrentToken();

      if (token === SPACE) {
        break;
      }

      if ((token > 'a' && token < 'z') || (token > 'A' && token < 'Z')) {
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
