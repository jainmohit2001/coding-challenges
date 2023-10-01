import { createHash } from 'crypto';
import { Commit } from '../objects/commit';
import { getSignature, verifyObject } from '../utils';
import zlib from 'zlib';
import fs from 'fs';
import path from 'path';
import { RELATIVE_PATH_TO_OBJECT_DIR } from '../constants';
import stream from 'stream';

export interface CommitTreeArgs {
  gitRoot: string;
  treeHash: string;
  parents?: string[];
  message?: string;
  stdin?: stream.Readable;
}

function commitTree({
  gitRoot,
  treeHash,
  parents = [],
  message,
  stdin = process.stdin
}: CommitTreeArgs): string {
  // Verify the hashes provided by the user
  treeHash = verifyObject(gitRoot, treeHash, 'tree');
  for (let i = 0; i < parents.length; i++) {
    parents[i] = verifyObject(gitRoot, parents[i], 'commit');
  }

  // If message is not provided in args then read from stdin
  if (message === undefined) {
    const buffer = stdin.read() as Buffer;
    if (buffer === null) {
      throw new Error('No message provided!');
    }
    message = buffer.toString();
  }

  // Get author and committer details from '~/.gitconfig's
  const signature = getSignature();

  const commitObject = new Commit({
    author: signature,
    committer: signature,
    message,
    treeHash: treeHash,
    parentHashes: parents
  });

  const store = commitObject.encode();
  const hash = createHash('sha1').update(store).digest('hex');

  const zlibContent = zlib.deflateSync(store);
  const pathToBlob = path.join(
    gitRoot,
    RELATIVE_PATH_TO_OBJECT_DIR,
    hash.substring(0, 2),
    hash.substring(2, hash.length)
  );
  fs.mkdirSync(path.dirname(pathToBlob), { recursive: true });
  fs.writeFileSync(pathToBlob, zlibContent);

  return hash;
}

export default commitTree;
