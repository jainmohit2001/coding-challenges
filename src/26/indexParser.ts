// The format of the index file is documented at https://github.com/git/git/blob/867b1c1bf68363bcfd17667d6d4b9031fa6a1300/Documentation/technical/index-format.txt

import fs from 'fs';
import {
  CTIME_NANO_OFFSET,
  CTIME_OFFSET,
  DEV_OFFSET,
  FILES_SIZE_OFFSET,
  FLAGS_OFFSET,
  GID_OFFSET,
  HASH_OFFSET,
  INO_OFFSET,
  LF,
  MODE_OFFSET,
  MTIME_NANO_OFFSET,
  MTIME_OFFSET,
  NAME_OFFSET,
  NULL,
  RELATIVE_PATH_TO_INDEX_FILE,
  SPACE,
  UID_OFFSET
} from './constants';
import { Index, IndexEntry, IndexHeader } from './objects';
import { CachedTree, CachedTreeEntry } from './objects/cachedTree';
import path from 'path';

export default class IndexParser {
  /**
   * The current index in the buffer.
   *
   * @private
   * @type {number}
   */
  private pos: number;

  /**
   * Stores the data from the .git/index file.
   *
   * @private
   * @type {Buffer}
   */
  private buf: Buffer;

  constructor(gitRoot: string) {
    this.pos = 0;
    // Make sure the index file is present
    if (!fs.existsSync(path.join(gitRoot, RELATIVE_PATH_TO_INDEX_FILE))) {
      throw new Error('Not a git repo');
    }
    this.buf = fs.readFileSync(path.join(gitRoot, RELATIVE_PATH_TO_INDEX_FILE));
  }

  private parseHeader(): IndexHeader {
    this.pos += 8;
    return {
      signature: this.buf.subarray(0, 4).toString(),
      version: this.buf.readInt32BE(4)
    };
  }

  private parseEntry(): IndexEntry {
    const entry = {} as IndexEntry;

    entry.ctimeSec = this.buf.readInt32BE(this.pos + CTIME_OFFSET);
    entry.ctimeNanoFrac = this.buf.readInt32BE(this.pos + CTIME_NANO_OFFSET);

    entry.mtimeSec = this.buf.readInt32BE(this.pos + MTIME_OFFSET);
    entry.mtimeNanoFrac = this.buf.readInt32BE(this.pos + MTIME_NANO_OFFSET);

    entry.dev = this.buf.readInt32BE(this.pos + DEV_OFFSET);

    entry.ino = this.buf.readInt32BE(this.pos + INO_OFFSET);

    entry.mode = this.buf.readInt32BE(this.pos + MODE_OFFSET);

    entry.uid = this.buf.readInt32BE(this.pos + UID_OFFSET);

    entry.gid = this.buf.readInt32BE(this.pos + GID_OFFSET);

    entry.size = this.buf.readInt32BE(this.pos + FILES_SIZE_OFFSET);

    entry.hash = this.buf
      .subarray(this.pos + HASH_OFFSET, this.pos + HASH_OFFSET + 20)
      .toString('hex');

    const flags = this.buf.readInt16BE(this.pos + FLAGS_OFFSET);
    entry.stage = (flags & (0b11 << 12)) >> 12;

    const nameLength = 0xfff & flags;
    entry.name = this.buf
      .subarray(this.pos + NAME_OFFSET, this.pos + NAME_OFFSET + nameLength)
      .toString('ascii');

    this.pos += NAME_OFFSET + nameLength;
    while (this.buf[this.pos] === NULL && this.pos < this.buf.length) {
      this.pos++;
    }

    return entry;
  }

  private parseTreeEntry(): CachedTreeEntry {
    const entry = {} as CachedTreeEntry;

    const nameStartPos = this.pos;
    while (this.pos < this.buf.length && this.buf[this.pos] !== NULL) {
      this.pos++;
    }
    entry.name = this.buf.subarray(nameStartPos, this.pos).toString('ascii');
    this.pos++;

    const entryCountStartPos = this.pos;
    while (this.pos < this.buf.length && this.buf[this.pos] !== SPACE) {
      this.pos++;
    }
    entry.entryCount = parseInt(
      this.buf.subarray(entryCountStartPos, this.pos).toString('ascii')
    );
    this.pos++;

    const subTreeCountStartPos = this.pos;
    while (this.pos < this.buf.length && this.buf[this.pos] !== LF) {
      this.pos++;
    }
    entry.subTreeCount = parseInt(
      this.buf.subarray(subTreeCountStartPos, this.pos).toString('ascii')
    );
    this.pos++;

    if (entry.entryCount >= 0) {
      entry.hash = this.buf.subarray(this.pos, this.pos + 20).toString('hex');
      this.pos += 20;
    }

    return entry;
  }

  private parseTreeExtension(size: number): CachedTree {
    const entries: CachedTreeEntry[] = [];
    const endPos = this.pos + size;

    while (this.pos < endPos) {
      const entry = this.parseTreeEntry();
      // console.log(entry);
      entries.push(entry);
    }

    return new CachedTree(entries);
  }

  private parseExtension(): CachedTree | undefined {
    const signature = this.buf.subarray(this.pos, this.pos + 4).toString();
    this.pos += 4;

    const size = this.buf.readInt32BE(this.pos);
    this.pos += 4;

    // Only TREE extensions are currently supported
    if (signature !== 'TREE') {
      this.pos += size;
      return undefined;
    }

    return this.parseTreeExtension(size);
  }

  /**
   * Parses the .git/index file and returns an instance of the Index class.
   *
   * @returns {Index}
   */
  parse(): Index {
    const header = this.parseHeader();

    const entriesCount = this.buf.readInt32BE(this.pos);
    this.pos += 4;

    const entries = new Array<IndexEntry>(entriesCount);

    for (let i = 0; i < entriesCount; i++) {
      const entry = this.parseEntry();
      // console.log(entry);
      entries[i] = entry;
    }

    // If no extensions present.
    // The minus twenty is to check if we have reached the starting the hash.
    if (this.pos === this.buf.byteLength - 20) {
      return new Index(header, entries);
    }

    return new Index(header, entries, this.parseExtension());
  }
}
