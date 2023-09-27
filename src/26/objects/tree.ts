export function encodeTreeEntry(e: TreeEntry): Buffer {
  const name = Buffer.from(e.name + '\0');
  const entryCount = Buffer.from(e.entryCount.toString() + ' ');
  const subTreeCount = Buffer.from(e.subTreeCount.toString() + '\n');
  const hash = Buffer.from(e.hash);

  return Buffer.concat([name, entryCount, subTreeCount, hash]);
}

export class Tree {
  private entries: TreeEntry[];

  constructor(entries: TreeEntry[]) {
    this.entries = entries;
  }

  add(entry: TreeEntry) {
    this.entries.push(entry);
  }

  encode(): Buffer {
    const entryBuffers: Buffer[] = [];
    let dataLength = 0;

    this.entries.forEach((entry) => {
      const entryBuffer = encodeTreeEntry(entry);
      dataLength += entryBuffer.byteLength;
      entryBuffers.push(entryBuffer);
    });

    const header = Buffer.alloc(8);
    header.set(Buffer.from('TREE'), 0);
    header.writeInt32BE(dataLength);

    return Buffer.concat([header, ...entryBuffers]);
  }
}

export interface TreeEntry {
  name: string;
  entryCount: number;
  subTreeCount: number;
  hash: string;
}
