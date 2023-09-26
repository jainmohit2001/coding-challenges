import fs from 'fs';
import { IndexEntry } from './commands/types';
import {
  CTIME_NANO_OFFSET,
  CTIME_OFFSET,
  DEV_OFFSET,
  FILES_SIZE_OFFSET,
  FLAGS_OFFSET,
  GID_OFFSET,
  HASH_OFFSET,
  INO_OFFSET,
  MODE_OFFSET,
  MTIME_NANO_OFFSET,
  MTIME_OFFSET,
  NAME_OFFSET,
  NULL,
  PATH_TO_INDEX_FILE,
  UID_OFFSET
} from './constants';

interface IndexHeader {
  signature: string;
  version: number;
  entriesCount: number;
}

interface Index {
  header: IndexHeader;
  entries: IndexEntry[];
}

export default class IndexParser {
  private pos: number;
  private buf: Buffer;

  constructor() {
    this.pos = 0;
    if (!fs.existsSync(PATH_TO_INDEX_FILE)) {
      throw new Error('Not a git repo');
    }
    this.buf = fs.readFileSync(PATH_TO_INDEX_FILE);
  }

  private parseHeader(): IndexHeader {
    this.pos += 12;
    return {
      signature: this.buf.subarray(0, 4).toString(),
      version: this.buf.readInt32BE(4),
      entriesCount: this.buf.readInt32BE(8)
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

    entry.type =
      ((0b1111 << 12) & this.buf.readInt32BE(this.pos + MODE_OFFSET)) >> 12;

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

  parse(): Index {
    const header = this.parseHeader();
    const entries: IndexEntry[] = [];

    for (let i = 0; i < header.entriesCount; i++) {
      const entry = this.parseEntry();
      entries.push(entry);
    }
    return { header, entries };
  }
}
