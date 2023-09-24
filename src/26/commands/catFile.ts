import fs from 'fs';
import { stderr, stdout } from 'process';
import { GitObjectType } from './types';
import zlib from 'zlib';
import path from 'path';

interface CatFileArgs {
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

function parseHeader(buffer: Buffer): Header {
  let i = 0;
  while (buffer[i] !== SPACE && i < buffer.byteLength) {
    i++;
  }

  const headerType = buffer.subarray(0, i).toString() as GitObjectType;
  const headerLength = parseInt(buffer.subarray(0, i).toString());

  return { type: headerType, length: headerLength };
}

function catFile({ object, t = false, p = false }: CatFileArgs) {
  if ((t && p) || (!t && !p)) {
    stderr.write('Invalid usage\r\n');
    process.exit(1);
  }

  const pathToFile = path.join(
    './.git/objects',
    object.substring(0, 2),
    object.substring(2, object.length)
  );

  if (!fs.existsSync(pathToFile)) {
    stderr.write('Invalid object');
    process.exit(1);
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
    stdout.write(header.type.toString() + '\r\n');
    process.exit(0);
  }

  stdout.write(fileContents.subarray(i + 1));
  process.exit(0);
}

export default catFile;
