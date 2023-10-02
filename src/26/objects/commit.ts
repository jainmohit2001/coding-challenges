import { LF } from '../constants';
import { parseObject } from '../utils';
import { Signature, decodeSignature } from './signature';

export interface CommitArgs {
  author: Signature;
  committer: Signature;
  message: string;
  treeHash: string;
  parentHashes: string[];
}

export class Commit {
  author: Signature;
  committer: Signature;
  message: string;
  treeHash: string;
  parentHashes: string[];

  constructor({
    author,
    committer,
    message,
    treeHash,
    parentHashes = []
  }: CommitArgs) {
    this.author = author;
    this.committer = committer;
    this.message = message;
    this.treeHash = treeHash;
    this.parentHashes = parentHashes;
  }

  encode(): Buffer {
    let content = `tree ${this.treeHash}\n`;

    this.parentHashes.forEach((hash) => {
      content += `parent ${hash}\n`;
    });

    content += `author ${this.author.toString()}`;

    content += `\ncommitter ${this.committer.toString()}`;

    // TODO: Check if the suffix '\n' is required or not.
    content += `\n\n${this.message}\n`;

    const contentBuffer = Buffer.from(content);
    const header = Buffer.from(`commit ${contentBuffer.byteLength}\0`);

    return Buffer.concat([header, contentBuffer]);
  }
}

export function decodeCommit(gitRoot: string, commitHash: string): Commit {
  const gitObject = parseObject(gitRoot, commitHash);
  const parents: string[] = [];
  const commit = {} as Commit;

  if (gitObject.type !== 'commit') {
    throw new Error('The given object is not a commit object');
  }

  const data = gitObject.data;
  let i = 0;

  for (i = 0; i < data.length; ) {
    const lineStartPos = i;
    while (data[i] !== LF) {
      i++;
    }

    const line = data.subarray(lineStartPos, i).toString().trim();
    const split = line.split(' ');
    if (line.length === 0) {
      // Message reached. Skipping the new line
      i += 1;
      break;
    }

    switch (split[0]) {
      case 'tree':
        commit.treeHash = split[1];
        break;
      case 'parent':
        parents.push(split[1]);
        break;
      case 'author':
        commit.author = decodeSignature(split);
        break;
      case 'committer':
        commit.committer = decodeSignature(split);
        break;
    }
  }

  commit.parentHashes = parents;
  commit.message = data.subarray(i).toString();

  return commit;
}
