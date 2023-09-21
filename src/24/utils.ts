export interface SubArg {
  subject: Buffer;
  group?: Buffer;
  sid: number;
}

export interface PubArg {
  subject: Buffer;
  replyTo?: Buffer;
  payloadSize: number;
  payload?: Buffer;
}

export interface UnsubArg {
  sid: number;
  maxMsgs?: number;
}

export function splitArgs(arg: Buffer): Buffer[] {
  const args: Buffer[] = [];
  let i = 0;
  let start = -1;
  for (i; i < arg.length; i++) {
    const b = arg[i];
    switch (b) {
      case WhiteSpace.SPACE:
      case WhiteSpace.NL:
      case WhiteSpace.TAB:
      case WhiteSpace.CR:
        if (start >= 0) {
          args.push(arg.subarray(start, i));
          start = -1;
        }
        break;
      default:
        if (start < 0) {
          start = i;
        }
    }
  }

  if (start >= 0) {
    args.push(arg.subarray(start));
  }

  return args;
}

export function parseSub(data: Buffer): SubArg {
  const args = splitArgs(data);

  const subArg: SubArg = {
    subject: Buffer.from(''),
    group: Buffer.from(''),
    sid: -1
  };

  switch (args.length) {
    case 2:
      subArg.subject = args[0];
      subArg.group = undefined;
      subArg.sid = parseInt(args[1].toString(), 10);
      break;
    case 3:
      subArg.subject = args[0];
      subArg.group = args[1];
      subArg.sid = parseInt(args[2].toString(), 10);
      break;
  }

  return subArg;
}

export function preparePub(data: Buffer): PubArg {
  const args = splitArgs(data);

  const pubArg: PubArg = {
    subject: Buffer.from(''),
    replyTo: undefined,
    payloadSize: 0,
    payload: undefined
  };

  switch (args.length) {
    case 2:
      pubArg.subject = args[0];
      pubArg.replyTo = undefined;
      pubArg.payloadSize = parseInt(args[1].toString(), 10);
      break;
    case 3:
      pubArg.subject = args[0];
      pubArg.replyTo = args[1];
      pubArg.payloadSize = parseInt(args[2].toString(), 10);
  }

  return pubArg;
}

export function parseUnsubArg(data: Buffer): UnsubArg {
  const args = splitArgs(data);

  const unsubArg: UnsubArg = {
    sid: -1,
    maxMsgs: undefined
  };

  switch (args.length) {
    case 1:
      unsubArg.sid = parseInt(args[0].toString(), 10);
      break;
    case 2:
      unsubArg.sid = parseInt(args[0].toString(), 10);
      unsubArg.maxMsgs = parseInt(args[1].toString(), 10);
      break;
  }

  return unsubArg;
}

enum WhiteSpace {
  SPACE = ' '.charCodeAt(0),
  NL = '\n'.charCodeAt(0),
  TAB = '\t'.charCodeAt(0),
  CR = '\r'.charCodeAt(0)
}
