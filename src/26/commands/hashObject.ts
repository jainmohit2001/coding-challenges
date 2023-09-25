// https://git-scm.com/docs/git-hash-object
import zlib from 'zlib';

import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import { BaseCommandArgs, GitObjectType } from './types';

interface HashObjectArgs extends BaseCommandArgs {
  type?: GitObjectType;
  write?: boolean;
  readFromStdin?: boolean;
  file?: string;
}

function hashObject({
  type = 'blob',
  write = false,
  readFromStdin = false,
  file = undefined,
  stdin = process.stdin,
  stdout = process.stdout,
  stderr = process.stderr
}: HashObjectArgs): void {
  let content: Buffer;

  try {
    if (readFromStdin) {
      content = stdin.read() as Buffer;
    } else if (file) {
      content = fs.readFileSync(file);
    } else {
      stderr.write('Invalid args. No file provided\n');

      return;
    }
  } catch (e) {
    const err = e as Error;
    stderr.write(`${err.message}\n`);
    return;
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

  stdout.write(hash + '\r\n');
}

export default hashObject;
