// https://github.com/git/git/blob/867b1c1bf68363bcfd17667d6d4b9031fa6a1300/Documentation/technical/index-format.txt#L38

import fs from 'fs';
import { PATH_TO_INDEX_FILE } from '../constants';
import { Index, IndexEntry, createIndexEntry } from '../objects';
import IndexParser from '../indexParser';

interface UpdateIndexArgs {
  add?: boolean;
  files?: string[];
}

function updateIndex({ add = false, files }: UpdateIndexArgs): string {
  if (files === undefined || files.length === 0) {
    throw new Error('Invalid args');
  }

  if (fs.existsSync(PATH_TO_INDEX_FILE)) {
    const index = new IndexParser().parse();

    files.forEach((file) => {
      const entry = createIndexEntry(file);
      index.remove(entry.name);
      index.add(entry);
    });

    index.saveToDisk();
    return '';
  }

  const entries: IndexEntry[] = [];
  files.forEach((file) => {
    entries.push(createIndexEntry(file));
  });

  const index = new Index({ signature: 'DIRC', version: 2 }, entries);

  index.saveToDisk();
  return '';
}

export default updateIndex;
