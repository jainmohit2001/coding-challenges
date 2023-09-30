import { globSync } from 'glob';
import { FileMode } from './enums';
import { FileStats, GitObjectType } from './types';
import fs from 'fs';
import path from 'path';
import {
  DEFAULT_IGNORE_PATTERNS,
  RELATIVE_PATH_TO_HEAD_FILE
} from './constants';

export const fileModeString = new Map<FileMode, string>([
  [FileMode.EMPTY, '0'],
  [FileMode.DIR, '0040000'],
  [FileMode.REGULAR, '0100644'],
  [FileMode.DEPRECATED, '0100664'],
  [FileMode.EXECUTABLE, '0100755'],
  [FileMode.SYMLINK, '0120000'],
  [FileMode.SUBMODULE, '0160000']
]);

export const fileType = new Map<FileMode, GitObjectType>([
  [FileMode.DIR, 'tree'],
  [FileMode.REGULAR, 'blob']
]);

/**
 * Returns a list of files present in the param - cwd.
 * It automatically includes the .gitignore file.
 *
 * @export
 * @param {string} gitRoot
 * @param {string} cwd
 * @returns {string[]}
 */
export function getFiles(gitRoot: string, cwd: string): string[] {
  const ignore = getIgnoredGlobPatterns(gitRoot);
  return globSync('**/*', {
    cwd,
    nodir: true,
    dot: true,
    ignore
  });
}

/**
 * Get stat for all the files (ignore files included in .gitignore).
 *
 * @param {string} gitRoot
 * @returns {Map<string, FileStats>}
 */
export function getFileStats(gitRoot: string): Map<string, FileStats> {
  const ignore = getIgnoredGlobPatterns(gitRoot);
  const files = globSync('**/*', {
    cwd: gitRoot,
    nodir: true,
    dot: true,
    ignore
  });

  const info = new Map<string, FileStats>();
  files.forEach((file) => {
    info.set(file, {
      stat: fs.lstatSync(path.join(gitRoot, file)),
      pathFromGitRoot: file
    });
  });

  return info;
}

/**
 * Finds the .gitignore file from the gitRoot (if present).
 * Returns an array of glob patterns that needs to be ignored.
 *
 * @param {string} gitRoot
 * @returns {string[]}
 */
export function getIgnoredGlobPatterns(gitRoot: string): string[] {
  const pathToGitIgnore = path.join(gitRoot, '.gitignore');
  if (!fs.existsSync(pathToGitIgnore)) {
    return DEFAULT_IGNORE_PATTERNS;
  }
  const content = fs.readFileSync(pathToGitIgnore).toString();
  const ignore = content.split(/\r\n|\n/);
  ignore.push(...DEFAULT_IGNORE_PATTERNS);
  return ignore;
}

/**
 * Finds the current branch from the `HEAD` file.
 *
 * @param {string} gitRoot
 * @returns {string}
 */
export function getCurrentBranchName(gitRoot: string): string {
  if (!fs.existsSync(path.join(gitRoot, RELATIVE_PATH_TO_HEAD_FILE))) {
    throw new Error('Invalid git repo: HEAD file is missing');
  }
  const content = fs
    .readFileSync(path.join(gitRoot, RELATIVE_PATH_TO_HEAD_FILE))
    .toString();
  const contentSplit = content.split('/');
  return contentSplit[contentSplit.length - 1];
}
