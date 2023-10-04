// https://github.com/git/git/blob/867b1c1bf68363bcfd17667d6d4b9031fa6a1300/Documentation/technical/index-format.txt#L38

import fs from 'fs';
import { RELATIVE_PATH_TO_INDEX_FILE } from '../constants';
import { Index, IndexEntry, createIndexEntry } from '../objects';
import IndexParser from '../indexParser';
import path from 'path';
import { getFiles } from '../utils';

interface UpdateIndexArgs {
  /**
   * The absolute path to the root of the Git repo.
   *
   * @type {string}
   */
  gitRoot: string;

  /**
   * List of files or directories.
   *
   * @type {?string[]}
   */
  files?: string[];
}

/**
 * Main function that performs the 'update-index' command
 *
 * @param {UpdateIndexArgs} { gitRoot, files }
 * @returns {string}
 */
function updateIndex({ gitRoot, files }: UpdateIndexArgs): string {
  // Ensure files or directories are provided
  if (files === undefined || files.length === 0) {
    throw new Error('Invalid args');
  }

  let filesToAdd: string[] = [];

  files.forEach((value) => {
    const isDir = fs.statSync(value).isDirectory();
    // If the given path is a directory, then get all the files present inside.
    if (isDir) {
      filesToAdd.push(...getFiles(gitRoot, value));
      return;
    }
    filesToAdd.push(value);
  });

  // Ensuring unique files
  filesToAdd = [...new Set(filesToAdd)];

  // If index file is already is present
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

      // Remove the previous information, then Add the new information
      index.remove(entry.name);
      index.add(entry);
    });

    // Finally save to disk and return nothing
    index.saveToDisk();
    return '';
  }

  // We are creating a new index file
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
