// https://github.com/git/git/blob/867b1c1bf68363bcfd17667d6d4b9031fa6a1300/Documentation/technical/index-format.txt#L38

import fs from 'fs';
import { RELATIVE_PATH_TO_INDEX_FILE } from '../constants';
import { Index, IndexEntry, createIndexEntry } from '../objects';
import IndexParser from '../indexParser';
import path from 'path';

interface UpdateIndexArgs {
  gitRoot: string;
  files?: string[];
}

function updateIndex({ gitRoot, files }: UpdateIndexArgs): string {
  // TODO: Ensure all the file paths are relative to gitRoot.
  if (files === undefined || files.length === 0) {
    throw new Error('Invalid args');
  }

  if (fs.existsSync(path.join(gitRoot, RELATIVE_PATH_TO_INDEX_FILE))) {
    const index = new IndexParser(gitRoot).parse();

    files.forEach((file) => {
      const entry = createIndexEntry(gitRoot, file);
      index.remove(entry.name);
      index.add(entry);
    });

    index.saveToDisk();
    return '';
  }

  const entries: IndexEntry[] = [];
  files.forEach((file) => {
    entries.push(createIndexEntry(gitRoot, file));
  });

  const index = new Index({ signature: 'DIRC', version: 2 }, entries);

  index.saveToDisk();
  return '';
}

export default updateIndex;
