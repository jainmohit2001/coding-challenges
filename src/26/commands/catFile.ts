import fs from 'fs';
import zlib from 'zlib';
import path from 'path';
import {
  SHA1Regex,
  SPACE,
  NULL,
  RELATIVE_PATH_TO_OBJECT_DIR
} from '../constants';
import { GitObjectType } from '../types';
import { fileModeString, fileType } from '../utils';

interface CatFileArgs {
  gitRoot: string;
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

function parseTreeFile(data: Buffer): string {
  const output: string[] = [];

  for (let i = 0; i < data.length; ) {
    // Format of each entry:
    // <mode><SPACE><filename><NULL><hash>
    const modeStartPos = i;
    while (data[i] !== SPACE) {
      i++;
    }
    const mode = parseInt(data.subarray(modeStartPos, i).toString(), 8);
    i++;

    const filenameStartPos = i;
    while (data[i] !== NULL) {
      i++;
    }
    const filename = data.subarray(filenameStartPos, i).toString();
    i++;

    const hash = data.subarray(i, i + 20).toString('hex');
    i += 20;
    output.push(
      `${fileModeString.get(mode)} ${fileType.get(mode)} ${hash} ${filename}`
    );
  }

  return output.join('\r\n');
}

function parseHeader(buffer: Buffer): Header {
  // Format of header:
  // <type><SPACE><length-in-bytes><NULL>
  let i = 0;
  while (buffer[i] !== SPACE && i < buffer.byteLength) {
    i++;
  }

  const headerType = buffer.subarray(0, i).toString() as GitObjectType;
  const headerLength = parseInt(buffer.subarray(0, i).toString());

  return { type: headerType, length: headerLength };
}

/**
 * Main function to perform the cat-file command.
 * Supported file types:
 * - blob
 * - tree
 *
 * @param {CatFileArgs} { gitRoot, object, t = false, p = false }
 * @returns {string}
 */
function catFile({
  gitRoot,
  object,
  t = false,
  p = false
}: CatFileArgs): string {
  if ((t && p) || (!t && !p)) {
    throw new Error('Invalid usage');
  }

  const pathToFile = path.join(
    gitRoot,
    RELATIVE_PATH_TO_OBJECT_DIR,
    object.substring(0, 2),
    object.substring(2, object.length)
  );

  if (!isValidSHA1(object) || !fs.existsSync(pathToFile)) {
    throw new Error('Invalid object');
  }

  // Unzip the content
  const fileContents = zlib.unzipSync(fs.readFileSync(pathToFile));

  // The header is present till we found a NULL character
  let i = 0;
  for (i; i < fileContents.length; i++) {
    if (fileContents[i] === NULL) {
      break;
    }
  }
  const header = parseHeader(fileContents.subarray(0, i));

  // The user asked for `type` only
  if (t) {
    return header.type.toString();
  }

  // The user asked for contents of the file
  switch (header.type) {
    case 'blob':
      return fileContents.subarray(i + 1).toString();
    case 'tree':
      return parseTreeFile(fileContents.subarray(i + 1));
  }

  throw new Error(`File ${header.type} not supported`);
}

export default catFile;
