// https://git-scm.com/docs/git-hash-object
import zlib from 'zlib';

import { createHash } from 'crypto';
import fs from 'fs';
import { stderr, stdin, stdout } from 'process';
import path from 'path';

interface HashObjectArgs {
  type?: 'blob' | 'commit' | 'tree' | 'tag';
  write?: boolean;
  readFromStdin?: boolean;
  file?: string;
}

function readContent(readFromStdin: boolean, file?: string): Buffer {
  try {
    if (readFromStdin) {
      return fs.readFileSync(stdin.fd);
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
  // Make sure we are in a git repo
  if (!fs.existsSync('./.git')) {
    stderr.write(
      'fatal: not a git repository (or any of the parent directories): .git\n'
    );
    process.exit(1);
  }

  const content = readContent(readFromStdin, file);

  const header = `${type} ${content.byteLength}\0`;
  const store = header + content.toString();
  const hash = createHash('sha1').update(store).digest('hex');

  if (write) {
    const zlibContent = zlib.deflateSync(store);
    const pathToBlob =
      './.git/objects' +
      hash.substring(0, 2) +
      '/' +
      hash.substring(2, hash.length);
    fs.mkdirSync(path.dirname(pathToBlob), { recursive: true });
    fs.writeFileSync(pathToBlob, zlibContent);
  }

  stdout.write(hash + '\r\n');
}

export { HashObjectArgs, hashObject };
