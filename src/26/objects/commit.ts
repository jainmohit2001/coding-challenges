import { Signature } from '../types';
import { getTimeAndTimeZone } from '../utils';

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

    content += `author ${this.author.name} <${
      this.author.email
    }> ${getTimeAndTimeZone(this.author.timestamp)}`;

    content += `\ncommitter ${this.committer.name} <${
      this.committer.email
    }> ${getTimeAndTimeZone(this.committer.timestamp)}`;

    content += `\n\n${this.message}\n`;

    const contentBuffer = Buffer.from(content);
    const header = Buffer.from(`commit ${contentBuffer.byteLength}\0`);

    return Buffer.concat([header, contentBuffer]);
  }
}
