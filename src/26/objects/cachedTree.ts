export function encodeCachedTreeEntry(e: CachedTreeEntry): Buffer {
  const name = Buffer.from(e.name + '\0');
  const entryCount = Buffer.from(e.entryCount.toString() + ' ');
  const subTreeCount = Buffer.from(e.subTreeCount.toString() + '\n');
  const hash = Buffer.from(e.hash, 'hex');

  return Buffer.concat([name, entryCount, subTreeCount, hash]);
}

export class CachedTree {
  entries: CachedTreeEntry[];

  constructor(entries: CachedTreeEntry[]) {
    this.entries = entries;
  }

  add(entry: CachedTreeEntry) {
    this.entries.push(entry);
  }

  remove(path: string): CachedTreeEntry | undefined {
    for (let i = 0; i < this.entries.length; i++) {
      if (this.entries[i].name === path) {
        const deletedElem = this.entries.splice(i, 1);
        return deletedElem[0];
      }
    }
    return undefined;
  }

  getEntry(path: string): CachedTreeEntry | undefined {
    for (let i = 0; i < this.entries.length; i++) {
      if (this.entries[i].name === path) {
        return this.entries[i];
      }
    }
    return undefined;
  }

  encode(): Buffer {
    const entryBuffers: Buffer[] = [];
    let dataLength = 0;

    this.entries.forEach((entry) => {
      const entryBuffer = encodeCachedTreeEntry(entry);
      dataLength += entryBuffer.byteLength;
      entryBuffers.push(entryBuffer);
    });

    const header = Buffer.alloc(8);
    header.set(Buffer.from('TREE'), 0);
    header.writeInt32BE(dataLength, 4);

    return Buffer.concat([header, ...entryBuffers]);
  }
}

export interface CachedTreeEntry {
  name: string;
  entryCount: number;
  subTreeCount: number;
  hash: string;
}
