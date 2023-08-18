type SupportCommands = 'set' | 'get' | 'add' | 'replace';

export interface IMemCommand {
  name: SupportCommands;
  key: string;
  flags?: number;
  expTime?: number;
  byteCount?: number;
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

export function parseMemCommand(input: string): IMemCommand {
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
