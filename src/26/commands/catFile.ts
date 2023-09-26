import fs from 'fs';
import { GitObjectType } from './types';
import zlib from 'zlib';
import path from 'path';
import { SHA1Regex, SPACE, NULL } from '../constants';

interface CatFileArgs {
  object: string;
  t?: boolean;
  p?: boolean;
}

interface Header {
  type: GitObjectType;
  length: number;
}

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

function catFile({ object, t = false, p = false }: CatFileArgs) {
  if ((t && p) || (!t && !p)) {
    throw new Error('Invalid usage');
  }

  const pathToFile = path.join(
    './.git/objects',
    object.substring(0, 2),
    object.substring(2, object.length)
  );

  if (!isValidSHA1(object) || !fs.existsSync(pathToFile)) {
    throw new Error('Invalid object');
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
    return header.type.toString();
  }

  return fileContents.subarray(i + 1).toString();
}

export default catFile;
