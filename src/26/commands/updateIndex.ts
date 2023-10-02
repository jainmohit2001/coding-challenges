// https://github.com/git/git/blob/867b1c1bf68363bcfd17667d6d4b9031fa6a1300/Documentation/technical/index-format.txt#L38

import fs from 'fs';
import { RELATIVE_PATH_TO_INDEX_FILE } from '../constants';
import { Index, IndexEntry, createIndexEntry } from '../objects';
import IndexParser from '../indexParser';
import path from 'path';
import { getFiles } from '../utils';

interface UpdateIndexArgs {
  gitRoot: string;
  files?: string[];
}

function updateIndex({ gitRoot, files }: UpdateIndexArgs): string {
  if (files === undefined || files.length === 0) {
    throw new Error('Invalid args');
  }

  let filesToAdd: string[] = [];

  files.forEach((value) => {
    const isDir = fs.statSync(value).isDirectory();
    if (isDir) {
      filesToAdd.push(...getFiles(gitRoot, value));
      return;
    }
    filesToAdd.push(value);
  });

  // Ensuring unique files
  filesToAdd = [...new Set(filesToAdd)];

  if (fs.existsSync(path.join(gitRoot, RELATIVE_PATH_TO_INDEX_FILE))) {
    const index = new IndexParser(gitRoot).parse();

    // Handle deleted files
    const paths = index.entries.map((e) => {
      return e.name;
    });

    paths.forEach((value) => {
      if (!fs.existsSync(path.join(gitRoot, value))) {
        index.remove(value);
      }
    });

    // Handle files that are present in working tree
    filesToAdd.forEach((file) => {
      const pathRelativeToGitRoot = path.relative(gitRoot, file);
      const entry = createIndexEntry(gitRoot, pathRelativeToGitRoot);
      index.remove(entry.name);
      index.add(entry);
    });

    index.saveToDisk();
    return '';
  }

  const entries: IndexEntry[] = [];
  filesToAdd.forEach((file) => {
    const pathRelativeToGitRoot = path.relative(gitRoot, file);
    entries.push(createIndexEntry(gitRoot, pathRelativeToGitRoot));
  });

  const index = new Index({ signature: 'DIRC', version: 2 }, entries);

  index.saveToDisk();
  return '';
}

export default updateIndex;
