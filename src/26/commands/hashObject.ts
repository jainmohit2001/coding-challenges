// https://git-scm.com/docs/git-hash-object
import zlib from 'zlib';

import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import { GitObjectType } from './types';
import stream from 'stream';

interface HashObjectArgs {
  type?: GitObjectType;
  write?: boolean;
  readFromStdin?: boolean;
  file?: string;
  stdin?: stream.Readable;
}

function hashObject({
  type = 'blob',
  write = false,
  readFromStdin = false,
  file = undefined,
  stdin = process.stdin
}: HashObjectArgs): string {
  let content: Buffer;

  if (readFromStdin) {
    content = stdin.read() as Buffer;
  } else if (file) {
    content = fs.readFileSync(file);
  } else {
    throw new Error('Invalid args. No file provided');
  }

  const header = `${type} ${content.byteLength}\0`;
  const store = header + content.toString();
  const hash = createHash('sha1').update(store).digest('hex');

  if (write) {
    const zlibContent = zlib.deflateSync(store);
    const pathToBlob = path.join(
      './.git/objects',
      hash.substring(0, 2),
      hash.substring(2, hash.length)
    );
    fs.mkdirSync(path.dirname(pathToBlob), { recursive: true });
    fs.writeFileSync(pathToBlob, zlibContent);
  }

  return hash;
}

export default hashObject;
