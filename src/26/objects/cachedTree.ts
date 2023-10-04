/**
 * This class corresponds to the cache Extension present in the .git/index file.
 *
 * @export
 * @class CachedTree
 */
export class CachedTree {
  entries: CachedTreeEntry[];

  constructor(entries: CachedTreeEntry[] = []) {
    this.entries = entries;
  }

  /**
   * Add a CachedTreeEntry to this tree.
   *
   * @param {CachedTreeEntry} entry
   */
  add(entry: CachedTreeEntry) {
    this.entries.push(entry);
  }

  /**
   * Remove and return the CachedTreeEntry corresponding to given path.
   * If not present, returns undefined.
   *
   * @param {string} path
   * @returns {(CachedTreeEntry | undefined)}
   */
  remove(path: string): CachedTreeEntry | undefined {
    for (let i = 0; i < this.entries.length; i++) {
      if (this.entries[i].name === path) {
        const deletedElem = this.entries.splice(i, 1);
        return deletedElem[0];
      }
    }
    return undefined;
  }

  /**
   * Finds the CachedTreeEntry corresponding to the given path.
   * Returns undefined if not found.
   *
   * @param {string} path
   * @returns {(CachedTreeEntry | undefined)}
   */
  getEntry(path: string): CachedTreeEntry | undefined {
    for (let i = 0; i < this.entries.length; i++) {
      if (this.entries[i].name === path) {
        return this.entries[i];
      }
    }
    return undefined;
  }

  /**
   * Encodes the given CachedTree.
   *
   * @returns {Buffer}
   */
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
  /**
   * The path of the DIR from the gitRoot.
   *
   * @type {string}
   */
  name: string;

  /**
   * Number of entries in the index that is covered by the
   * tree this node represents.
   *
   * @type {number}
   */
  entryCount: number;

  /**
   * Number of subtrees this tree has.
   *
   * @type {number}
   */
  subTreeCount: number;

  /**
   * The object hash corresponding to the Tree.
   *
   * @type {string}
   */
  hash: string;
}

/**
 * Encodes the given CachedTreeEntry
 *
 * @export
 * @param {CachedTreeEntry} e
 * @returns {Buffer}
 */
export function encodeCachedTreeEntry(e: CachedTreeEntry): Buffer {
  const prefix = Buffer.from(`${e.name}\0${e.entryCount} ${e.subTreeCount}\n`);
  const hash = Buffer.from(e.hash, 'hex');

  return Buffer.concat([prefix, hash]);
}
