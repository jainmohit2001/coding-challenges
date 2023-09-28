import fs from 'fs';
import {
  DEFAULT_IGNORE_PATTERNS,
  RELATIVE_PATH_TO_HEAD_FILE,
  RELATIVE_PATH_TO_INDEX_FILE
} from '../constants';
import IndexParser from '../indexParser';
import path from 'path';
import hashObject from './hashObject';
import { globSync } from 'glob';

/**
 * Finds the current branch from the `HEAD` file.
 *
 * @param {string} gitRoot
 * @returns {string}
 */
function getCurrentBranchName(gitRoot: string): string {
  if (!fs.existsSync(path.join(gitRoot, RELATIVE_PATH_TO_HEAD_FILE))) {
    throw new Error('Invalid git repo: HEAD file is missing');
  }
  const content = fs
    .readFileSync(path.join(gitRoot, RELATIVE_PATH_TO_HEAD_FILE))
    .toString();
  const contentSplit = content.split('/');
  return contentSplit[contentSplit.length - 1];
}

/**
 * Finds the .gitignore file from the gitRoot (if present).
 * Returns an array of glob patterns that needs to be ignored.
 *
 * @param {string} gitRoot
 * @returns {string[]}
 */
function getIgnoredGlobPatterns(gitRoot: string): string[] {
  const pathToGitIgnore = path.join(gitRoot, '.gitignore');
  if (!fs.existsSync(pathToGitIgnore)) {
    return DEFAULT_IGNORE_PATTERNS;
  }
  const content = fs.readFileSync(pathToGitIgnore).toString();
  const ignore = content.split(/\r\n|\n/);
  ignore.push(...DEFAULT_IGNORE_PATTERNS);
  return ignore;
}

interface FileStats {
  /**
   * Information about a file.
   *
   * @type {fs.Stats}
   */
  stat: fs.Stats;

  /**
   * Path from the root of the current git repo.
   *
   * @type {string}
   */
  pathFromGitRoot: string;
}

/**
 * Get stat for all the files (ignore files included in .gitignore).
 *
 * @param {string} gitRoot
 * @returns {Map<string, FileStats>}
 */
function getFileStats(gitRoot: string): Map<string, FileStats> {
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
 * Creates a human readable output for the status command
 *
 * @param {string} gitRoot
 * @param {string[]} untracked
 * @param {string[]} deletedFile
 * @param {string[]} changedFile
 * @param {string} branch
 * @returns {string}
 */
function prepareOutput(
  gitRoot: string,
  untracked: string[],
  deletedFile: string[],
  changedFile: string[],
  branch: string
): string {
  let str = `On branch ${branch}\r\n\r\n`;
  const cwd = path.relative(gitRoot, process.cwd());
  console.log(path.relative(cwd, changedFile[0]));

  if (
    untracked.length === 0 &&
    deletedFile.length === 0 &&
    changedFile.length === 0
  ) {
    str += 'nothing to commit, working tree clean';
    return str;
  }

  if (deletedFile.length > 0 || changedFile.length > 0) {
    str += 'Changes to be committed\r\n\x1b[31m';
    deletedFile.forEach((file) => {
      str += `\tdeleted:    ${path.relative(cwd, file)}\r\n`;
    });
    changedFile.forEach((file) => {
      str += `\tmodified:   ${path.relative(cwd, file)}\r\n`;
    });

    str += '\x1b[0m';

    if (untracked.length > 0) {
      str += '\r\n';
    }
  }

  if (untracked.length > 0) {
    str += 'Untracked files:\r\n\x1b[31m';
    untracked.forEach((file) => {
      str += `\t${path.relative(cwd, file)}\r\n`;
    });
    str += '\x1b[0m';
  }

  return str;
}

/**
 * Main function that handles the `status` command.
 *
 * @param {string} gitRoot
 * @returns {string}
 */
function status(gitRoot: string): string {
  const currentBranch = getCurrentBranchName(gitRoot);

  const fileStats = getFileStats(gitRoot);

  const untracked: string[] = [];
  const deleteFile: string[] = [];
  const changedFile: string[] = [];

  // No index file is present. All the files will be set as untracked.
  if (!fs.existsSync(path.join(gitRoot, RELATIVE_PATH_TO_INDEX_FILE))) {
    fileStats.forEach((file) => {
      untracked.push(file.pathFromGitRoot);
    });
    return prepareOutput(
      gitRoot,
      untracked,
      deleteFile,
      changedFile,
      currentBranch
    );
  }

  const index = new IndexParser(gitRoot).parse();

  // Finding diff between current working tree (file system) and staging area.
  index.entries.forEach((entry) => {
    // File present in index but not in working tree => `deleted`
    if (!fileStats.has(entry.name)) {
      deleteFile.push(entry.name);
      return;
    }

    const hash = hashObject({ gitRoot, file: path.join(gitRoot, entry.name) });
    // File present in index and working tree but hash if changed => `modified`
    if (entry.hash !== hash) {
      changedFile.push(entry.name);
    }
    // TODO: Handle when hash is same but file is not committed => 'new file`

    fileStats.delete(entry.name);
  });

  // Files present in working tree but not in index => `untracked`
  fileStats.forEach((value) => {
    untracked.push(value.pathFromGitRoot);
  });

  return prepareOutput(
    gitRoot,
    untracked,
    deleteFile,
    changedFile,
    currentBranch
  );
}

export default status;
