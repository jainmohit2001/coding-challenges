type SupportCommands = 'set' | 'get' | 'add' | 'replace';

export interface IMemCommand {
  /**
   * The name of the support command.
   *
   * @type {SupportCommands}
   */
  name: SupportCommands;

  /**
   * The key corresponding to the command.
   *
   * @type {string}
   */
  key: string;

  /**
   * Flags for the command.
   * This is used in set, add and replace command.
   *
   * @type {?number}
   */
  flags?: number;

  /**
   * The expiry time in seconds for the data.
   * This is used in set, add and replace command.
   *
   * @type {?number}
   */
  expTime?: number;

  /**
   * Number of bytes for the data.
   * This is used in set, add and replace command.
   *
   * @type {?number}
   */
  byteCount?: number;

  /**
   * If true then the server will not reply to the command.
   *
   * @type {?boolean}
   */
  noReply?: boolean;
}

export class MemCommand implements IMemCommand {
  name;
  key;
  flags?;
  expTime?;
  byteCount?;
  noReply?;

  constructor(
    commandName: SupportCommands,
    key: string,
    flags?: number,
    expTime?: number,
    byteCount?: number,
    noReply: boolean = false
  ) {
    this.name = commandName;
    this.key = key;
    this.flags = flags;
    this.expTime = expTime;
    this.byteCount = byteCount;
    this.noReply = noReply;
  }
}

/**
 * Function used to parse a valid command.
 * The commands follow the following format:
 *
 * `<command name> <key> <flags> <expTime> <byte count> [noreply]`
 *
 * The trailing CRLF is already removed while reading the data from the socket.
 *
 * @export
 * @param {string} input
 * @returns {IMemCommand}
 */
export function parseMemCommand(input: string): IMemCommand {
  // Split the command params with space
  const params = input.split(' ');

  const name = params[0] as SupportCommands;

  const key = params[1];

  let flags;
  if (params[2]) {
    flags = parseInt(params[2]);
  }

  let expTime;
  if (params[3] && (name === 'set' || name === 'add' || name === 'replace')) {
    try {
      expTime = parseInt(params[3]);
    } catch (e) {
      expTime = undefined;
    }
  }

  let byteCount;
  if (params[4] && (name === 'set' || name === 'add' || name === 'replace')) {
    byteCount = parseInt(params[4]);
  }

  const noreply = params[params.length - 1] === 'noreply';

  return new MemCommand(name, key, flags, expTime, byteCount, noreply);
}
