// https://git-scm.com/docs/git-hash-object

import { createHash } from 'crypto';
import fs from 'fs';
import { stderr, stdin, stdout } from 'process';

interface HashObjectArgs {
  type?: 'blob' | 'commit' | 'tree' | 'tag';
  write?: boolean;
  readFromStdin?: boolean;
  file?: string;
}

function readContent(readFromStdin: boolean, file?: string): Buffer {
  try {
    if (readFromStdin) {
      return fs.readFileSync(0);
    } else if (file) {
      return fs.readFileSync(file);
    }

    stderr.write('Invalid args. No file provided\n');
    process.exit(1);
  } catch (e) {
    const err = e as Error;
    stderr.write(`${err.message}\n`);
    process.exit(1);
  }
}

function hashObject({
  type = 'blob',
  write = false,
  readFromStdin = false,
  file = undefined
}: HashObjectArgs): void {
  const content = readContent(readFromStdin, file);

  const header = `${type} ${content.byteLength}\0`;
  const store = header + content.toString();
  const hash = createHash('sha1').update(store).digest('hex');
  stdout.write(hash + '\r\n');
}

export { HashObjectArgs, hashObject };
