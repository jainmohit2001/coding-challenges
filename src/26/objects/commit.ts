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

  /**
   * Encodes the Commit object for storage purposes.
   *
   * @returns {Buffer}
   */
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

/**
 * This function returns a Commit object given the hash of the object.
 *
 * @export
 * @param {string} gitRoot
 * @param {string} commitHash
 * @returns {Commit}
 */
export function decodeCommit(gitRoot: string, commitHash: string): Commit {
  const gitObject = parseObject(gitRoot, commitHash);
  const parents: string[] = [];
  const commit = {} as Commit;

  // Ensure the given hash corresponds to a commit object only
  if (gitObject.type !== 'commit') {
    throw new Error('The given object is not a commit object');
  }

  const data = gitObject.data;
  let i = 0;

  // Parse the data
  for (i = 0; i < data.length; ) {
    const lineStartPos = i;
    while (data[i] !== LF) {
      i++;
    }

    const line = data.subarray(lineStartPos, i).toString().trim();
    i++; // Skip the New line Char

    const split = line.split(' ');
    if (line.length === 0) {
      // Message reached
      break;
    }

    switch (split[0]) {
      case 'tree':
        // "tree <hash>"
        commit.treeHash = split[1];
        break;
      case 'parent':
        // "parent <hash>"
        parents.push(split[1]);
        break;
      case 'author':
        // "author <signature-data>"
        commit.author = decodeSignature(
          line.substring(split[0].length + 1, line.length)
        );
        break;
      case 'committer':
        // "committer <signature-data>"
        commit.committer = decodeSignature(
          line.substring(split[0].length + 1, line.length)
        );
        break;
      default:
        throw new Error(`Invalid character ${split[0]} found at ${i}`);
    }
  }

  commit.parentHashes = parents;
  commit.message = data.subarray(i).toString().trim();

  return commit;
}
