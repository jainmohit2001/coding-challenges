export interface SubArg {
  subject: Buffer;
  group?: Buffer;
  sid: Buffer;
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
    sid: Buffer.from('')
  };

  switch (args.length) {
    case 2:
      subArg.subject = args[0];
      subArg.group = undefined;
      subArg.sid = args[1];
      break;
    case 3:
      subArg.subject = args[0];
      subArg.group = args[1];
      subArg.sid = args[2];
      break;
  }

  return subArg;
}

enum WhiteSpace {
  SPACE = ' '.charCodeAt(0),
  NL = '\n'.charCodeAt(0),
  TAB = '\t'.charCodeAt(0),
  CR = '\r'.charCodeAt(0)
}
