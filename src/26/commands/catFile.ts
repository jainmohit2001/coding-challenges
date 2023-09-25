import fs from 'fs';
import { BaseCommandArgs, GitObjectType } from './types';
import zlib from 'zlib';
import path from 'path';

interface CatFileArgs extends BaseCommandArgs {
  object: string;
  t?: boolean;
  p?: boolean;
}

interface Header {
  type: GitObjectType;
  length: number;
}

const NULL = Buffer.from('\0')[0];
const SPACE = Buffer.from(' ')[0];

const SHA1Regex = /^[a-fA-F0-9]{40}$/;

function isValidSHA1(s: string): boolean {
  return !!SHA1Regex.exec(s);
}

function parseHeader(buffer: Buffer): Header {
  let i = 0;
  while (buffer[i] !== SPACE && i < buffer.byteLength) {
    i++;
  }

  const headerType = buffer.subarray(0, i).toString() as GitObjectType;
  const headerLength = parseInt(buffer.subarray(0, i).toString());

  return { type: headerType, length: headerLength };
}

function catFile({
  object,
  t = false,
  p = false,
  stdout = process.stdout,
  stderr = process.stderr
}: CatFileArgs) {
  if ((t && p) || (!t && !p)) {
    stderr.write('Invalid usage\r\n');
    return;
  }

  const pathToFile = path.join(
    './.git/objects',
    object.substring(0, 2),
    object.substring(2, object.length)
  );

  if (!isValidSHA1(object) || !fs.existsSync(pathToFile)) {
    stderr.write('Invalid object\r\n');
    return;
  }

  const fileContents = zlib.unzipSync(fs.readFileSync(pathToFile));

  let i = 0;
  for (i; i < fileContents.length; i++) {
    if (fileContents[i] === NULL) {
      break;
    }
  }
  const header = parseHeader(fileContents.subarray(0, i));

  if (t) {
    stdout.write(`${header.type.toString()}\r\n`);
    return;
  }

  stdout.write(fileContents.subarray(i + 1));
}

export default catFile;
