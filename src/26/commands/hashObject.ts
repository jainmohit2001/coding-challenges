// https://git-scm.com/docs/git-hash-object
import zlib from 'zlib';

import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import { GitObjectType } from '../types';
import stream from 'stream';
import { RELATIVE_PATH_TO_OBJECT_DIR } from '../constants';

interface HashObjectArgs {
  gitRoot: string;
  type?: GitObjectType;
  write?: boolean;
  readFromStdin?: boolean;
  file?: string;
  stdin?: stream.Readable;
}

function hashObject({
  gitRoot,
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

  const header = Buffer.from(`${type} ${content.byteLength}\0`);
  const store = Buffer.concat([header, content]);
  const hash = createHash('sha1').update(store).digest('hex');

  if (write) {
    const zlibContent = zlib.deflateSync(store);
    const pathToBlob = path.join(
      gitRoot,
      RELATIVE_PATH_TO_OBJECT_DIR,
      hash.substring(0, 2),
      hash.substring(2, hash.length)
    );
    fs.mkdirSync(path.dirname(pathToBlob), { recursive: true });
    fs.writeFileSync(pathToBlob, zlibContent);
  }

  return hash;
}

export default hashObject;
