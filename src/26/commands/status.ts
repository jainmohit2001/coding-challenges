import { ColorReset, FgGreen, FgRed } from '../constants';
import path from 'path';
import { getCurrentBranchName } from '../utils';
import { FileStatusCode } from '../enums';
import { getFileStatus } from '../fileStatus';
import { FileStatus } from '../types';

/**
 * Prepares a human readable output from a list of FileStatus objects.
 *
 * @param {string} gitRoot
 * @param {string} branch
 * @param {FileStatus[]} files
 * @returns {string}
 */
function prepareOutput(
  gitRoot: string,
  branch: string,
  files: Map<string, FileStatus>
): string {
  const cwd = path.relative(gitRoot, process.cwd());
  const arr = [...files.values()].sort((a, b) => a.name.localeCompare(b.name));
  let str = `On branch ${branch}`;
  let changesToBeCommitted = '';
  let changesNotStaged = '';
  let untrackedFiles = '';

  arr.forEach((e) => {
    const name = path.relative(cwd, e.name);

    switch (e.worktree) {
      case FileStatusCode.UNMODIFIED:
        break;
      case FileStatusCode.UNTRACKED:
        untrackedFiles += `\t${name}\r\n`;
        break;
      case FileStatusCode.DELETED:
        changesNotStaged += `\tdeleted:    ${name}\r\n`;
        break;
      case FileStatusCode.MODIFIED:
        changesNotStaged += `\tmodified:   ${name}\r\n`;
        break;
      default:
        throw new Error(`Invalid worktree status ${e}`);
    }

    switch (e.staging) {
      case FileStatusCode.ADDED:
        changesToBeCommitted += `\tnew file:   ${name}\r\n`;
        break;
      case FileStatusCode.DELETED:
        changesToBeCommitted += `\tdeleted:    ${name}\r\n`;
        break;
      case FileStatusCode.MODIFIED:
        changesToBeCommitted += `\tmodified:   ${name}\r\n`;
        break;
      case FileStatusCode.UNMODIFIED:
      case FileStatusCode.UNTRACKED:
        break;
    }
  });

  if (changesToBeCommitted.length > 0) {
    str += `\r\nChanges to be committed:\r\n${FgGreen}${changesToBeCommitted}${ColorReset}`;
  }
  if (changesNotStaged.length > 0) {
    str += `\r\nChanges not staged for commit:\r\n${FgRed}${changesNotStaged}${ColorReset}`;
  }
  if (untrackedFiles.length > 0) {
    str += `\r\nUntracked files:\r\n${FgRed}${untrackedFiles}${ColorReset}`;
  }

  if (changesToBeCommitted.length === 0) {
    if (untrackedFiles.length === 0 && changesNotStaged.length === 0) {
      str += '\r\nnothing to commit, working tree clean';
    } else {
      str += '\r\nno changes added to commit';
    }
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
  const branch = getCurrentBranchName(gitRoot);
  const files = getFileStatus(gitRoot, branch);
  return prepareOutput(gitRoot, branch, files);
}

export default status;
