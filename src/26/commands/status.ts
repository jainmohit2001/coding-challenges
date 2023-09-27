import fs from 'fs';
import { PATH_TO_HEAD_FILE, PATH_TO_INDEX_FILE } from '../constants';
import IndexParser from '../indexParser';
import path from 'path';
import hashObject from './hashObject';
import { globSync } from 'glob';

function getCurrentBranchName(): string {
  if (!fs.existsSync(PATH_TO_HEAD_FILE)) {
    throw new Error('Invalid git repo: HEAD file is missing');
  }
  const content = fs.readFileSync(PATH_TO_HEAD_FILE).toString();
  const contentSplit = content.split('/');
  return contentSplit[contentSplit.length - 1];
}

function getIgnoredGlobPatterns(): string[] {
  if (!fs.existsSync('.gitignore')) {
    return ['.git/**'];
  }
  const content = fs.readFileSync('.gitignore').toString();
  const ignore = content.split(/\r\n|\n/);
  ignore.push('.git/**');
  return ignore;
}

interface FileStats {
  name: string;
  stat: fs.Stats;
}

function getFileStats(root: string): Map<string, FileStats> {
  const ignore = getIgnoredGlobPatterns();
  const files = globSync('**/*', {
    cwd: root,
    nodir: true,
    dot: true,
    ignore
  });

  const info = new Map<string, FileStats>();
  files.forEach((file) => {
    const name = path.relative(root, file);
    info.set(name, { name, stat: fs.lstatSync(file) });
  });

  return info;
}

function prepareOutput(
  untracked: string[],
  deletedFile: string[],
  changedFile: string[],
  branch: string
): string {
  let str = `On branch ${branch}\r\n\r\n`;

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
      str += `\tdeleted:    ${file}\r\n`;
    });
    changedFile.forEach((file) => {
      str += `\tmodified:   ${file}\r\n`;
    });

    str += '\x1b[0m';

    if (untracked.length > 0) {
      str += '\r\n';
    }
  }

  if (untracked.length > 0) {
    str += 'Untracked files:\r\n\x1b[31m';
    untracked.forEach((file) => {
      str += `\t${file}\r\n`;
    });
    str += '\x1b[0m';
  }

  return str;
}

function status() {
  const currentBranch = getCurrentBranchName();

  // Assuming the function is being called from the root of git repo.
  // TODO: add support for calling this function from a subdirectory.
  const root = process.cwd();
  const fileStats = getFileStats(root);

  const untracked: string[] = [];
  const deleteFile: string[] = [];
  const changedFile: string[] = [];

  // No index file is present. All the files will be set as untracked.
  if (!fs.existsSync(PATH_TO_INDEX_FILE)) {
    fileStats.forEach((file) => {
      untracked.push(file.name);
    });
    return prepareOutput(untracked, deleteFile, changedFile, currentBranch);
  }

  const index = new IndexParser().parse();

  index.entries.forEach((entry) => {
    if (!fileStats.has(entry.name)) {
      deleteFile.push(entry.name);
      return;
    }

    const hash = hashObject({ file: entry.name });
    if (entry.hash !== hash) {
      changedFile.push(entry.name);
    }
    fileStats.delete(entry.name);
  });

  fileStats.forEach((value) => {
    untracked.push(value.name);
  });

  return prepareOutput(untracked, deleteFile, changedFile, currentBranch);
}

export default status;
