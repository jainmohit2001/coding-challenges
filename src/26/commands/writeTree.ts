import path from 'path';
import { GitObjectType } from '../types';
import zlib from 'zlib';
import { createHash } from 'crypto';
import fs from 'fs';
import { CachedTree, CachedTreeEntry } from '../objects/cachedTree';
import IndexParser from '../indexParser';
import { RELATIVE_PATH_TO_OBJECT_DIR } from '../constants';

function writeTree(gitRoot: string): string {
  const index = new IndexParser(gitRoot).parse();

  const objectType: GitObjectType = 'tree';
  const entryBuffers: Buffer[] = [];

  for (let i = 0; i < index.entries.length; i++) {
    // Assuming all entries are file and no directory is present
    // TODO: Handle directory
    const e = index.entries[i];
    entryBuffers.push(
      Buffer.concat([
        Buffer.from(`${e.mode.toString(8)} ${e.name}\0`),
        Buffer.from(e.hash, 'hex')
      ])
    );
  }

  const content = Buffer.concat(entryBuffers);
  const header = Buffer.from(`${objectType} ${content.byteLength}\0`);
  const store = Buffer.concat([header, content]);

  const hash = createHash('sha1').update(store).digest('hex');

  const zlibContent = zlib.deflateSync(store);
  const pathToBlob = path.join(
    gitRoot,
    RELATIVE_PATH_TO_OBJECT_DIR,
    hash.substring(0, 2),
    hash.substring(2, hash.length)
  );
  fs.mkdirSync(path.dirname(pathToBlob), { recursive: true });
  fs.writeFileSync(pathToBlob, zlibContent, { encoding: 'hex' });

  // Assuming all path from root is '';
  const cachedTreeEntry: CachedTreeEntry = {
    name: '',
    hash: hash,
    subTreeCount: 0,
    entryCount: index.entries.length
  };

  index.cache = new CachedTree([cachedTreeEntry]);
  index.saveToDisk();
  return hash;
}

export default writeTree;
