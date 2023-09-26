// https://github.com/git/git/blob/867b1c1bf68363bcfd17667d6d4b9031fa6a1300/Documentation/technical/index-format.txt#L38

import { EntryType, Stage } from '../enums';
import hashObject from './hashObject';
import { IndexEntry } from './types';
import fs from 'fs';
import { createHash } from 'crypto';
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
  PATH_TO_INDEX_FILE,
  PREFIX_SIZE,
  UID_OFFSET
} from '../constants';
import path from 'path';

interface UpdateIndexArgs {
  add?: boolean;
  files?: string[];
}

function createIndexHeader(size: number, version: 2 | 3 | 4 = 2): Buffer {
  const buf = Buffer.alloc(12, 0);
  buf.set(Buffer.from('DIRC'), 0);
  buf.writeInt32BE(version, 4);
  buf.writeInt32BE(size, 8);
  return buf;
}

function createIndexEntry(file: string): IndexEntry {
  const stat = fs.lstatSync(file);

  const ctimeSec = Math.floor(stat.ctimeMs / 1000);

  const ctimeNanoFrac = Math.floor((stat.ctimeMs - ctimeSec * 1000) * 1000_000);

  const mtimeSec = Math.floor(stat.mtimeMs / 1000);

  const mtimeNanoFrac = Math.floor((stat.mtimeMs - mtimeSec * 1000) * 1000_000);

  const filePath = path.relative(process.cwd(), file);

  return {
    ctimeSec,
    ctimeNanoFrac,
    mtimeSec,
    mtimeNanoFrac,
    dev: stat.dev,
    ino: stat.ino,
    type: EntryType.REGULAR,
    uid: stat.uid,
    gid: stat.gid,
    size: stat.size,
    hash: hashObject({ file: file, write: true }),
    name: filePath,
    stage: Stage.ZERO,
    skipWorkTree: false,
    intentToAdd: false
  };
}

function encodeIndexEntry(e: IndexEntry): Buffer {
  const prefix = Buffer.alloc(PREFIX_SIZE, 0);

  prefix.writeUInt32BE(e.ctimeSec, CTIME_OFFSET);
  prefix.writeUInt32BE(e.ctimeNanoFrac, CTIME_NANO_OFFSET);

  prefix.writeUInt32BE(e.mtimeSec, MTIME_OFFSET);
  prefix.writeUInt32BE(e.mtimeNanoFrac, MTIME_NANO_OFFSET);

  prefix.writeUInt32BE(e.dev, DEV_OFFSET);

  prefix.writeUInt32BE(e.ino, INO_OFFSET);

  prefix.writeUInt32BE((e.type << 12) | 0o0644, MODE_OFFSET);

  prefix.writeUInt32BE(e.uid, UID_OFFSET);

  prefix.writeUInt32BE(e.gid, GID_OFFSET);

  prefix.writeUInt32BE(e.size, FILES_SIZE_OFFSET);

  prefix.set(Buffer.from(e.hash, 'hex'), HASH_OFFSET);

  const nameLength = e.name.length < 0xfff ? e.name.length : 0xfff;
  prefix.writeUInt16BE((e.stage << 12) | nameLength, FLAGS_OFFSET);

  const pathName = Buffer.from(e.name, 'ascii'); // variable

  // Ensure padding size is in between 1 - 8
  let paddingSize = (PREFIX_SIZE + pathName.byteLength) % 8;
  if (paddingSize === 0) {
    paddingSize = 8;
  } else if (paddingSize > 4) {
    paddingSize = 8 - paddingSize;
  }

  const padding = Buffer.alloc(paddingSize, '\0');

  return Buffer.concat([prefix, pathName, padding]);
}

function updateIndex({ add = false, files }: UpdateIndexArgs): string {
  if (fs.existsSync(PATH_TO_INDEX_FILE)) {
    // TODO: Handle case when Index file already exists
    // return;
  }

  if (files === undefined || files.length === 0) {
    throw new Error('Invalid args');
  }

  const header = createIndexHeader(1, 2);
  const entry = createIndexEntry(files[0]);
  const indexContent = Buffer.concat([header, encodeIndexEntry(entry)]);

  const checksum = Buffer.from(
    createHash('sha1').update(indexContent).digest('hex'),
    'hex'
  );

  fs.writeFileSync(
    PATH_TO_INDEX_FILE,
    Buffer.concat([indexContent, checksum]),
    'hex'
  );
  return '';
}

export default updateIndex;
