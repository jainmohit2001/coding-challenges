/**
 * This interface corresponds to the args passed with SUB command.
 *
 * @export
 * @interface SubArg
 */
export interface SubArg {
  subject: Buffer;
  group?: Buffer;
  sid: number;
}

/**
 * This interface corresponds to the args passed with PUB command.
 *
 * @export
 * @interface PubArg
 */
export interface PubArg {
  subject: Buffer;
  replyTo?: Buffer;
  payloadSize: number;
  payload?: Buffer;
}

/**
 * This interface corresponds to the args passed with UNSUB command.
 *
 * @export
 * @interface UnsubArg
 */
export interface UnsubArg {
  sid: number;
  maxMsgs?: number;
}

/**
 * Returns a list of Buffer after performing the split operation.
 * The Whitespace characters include SPACE, CR, NL and TAB.
 *
 * @export
 * @param {Buffer} arg
 * @returns {Buffer[]}
 */
export function splitArgs(arg: Buffer): Buffer[] {
  const args: Buffer[] = [];
  let i = 0;

  // Start corresponds to the start index of an arg
  let start = -1;

  for (i; i < arg.length; i++) {
    const b = arg[i];
    switch (b) {
      case WhiteSpace.SPACE:
      case WhiteSpace.NL:
      case WhiteSpace.TAB:
      case WhiteSpace.CR:
        if (start >= 0) {
          // A new arg found between start and i
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

  // When the arg is at the end of the input Buffer
  if (start >= 0) {
    args.push(arg.subarray(start));
  }

  return args;
}

/**
 * Parses the args for SUB command.
 *
 * @export
 * @param {Buffer} data
 * @returns {SubArg}
 */
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

/**
 * Parses the args for PUB command.
 *
 * @export
 * @param {Buffer} data
 * @returns {PubArg}
 */
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

/**
 * Parses the args for UNSUB command.
 *
 * @export
 * @param {Buffer} data
 * @returns {UnsubArg}
 */
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
