import { FileMode, FileStatusCode } from '../enums';
import { getFileStatus } from '../fileStatus';
import IndexParser from '../indexParser';
import { fileModeString, getCurrentBranchName, parseObject } from '../utils';
import fs from 'fs';
import hashObject from './hashObject';
import { createTwoFilesPatch } from 'diff';
import {
  BoldEnd,
  BoldStart,
  ColorReset,
  FgCyan,
  FgGreen,
  FgRed
} from '../constants';

interface FileInfo {
  name: string;
  content: string;
  hash: string;
}

function diffFile(
  a: FileInfo,
  b: FileInfo,
  status: FileStatusCode,
  mode: FileMode
): string {
  let str = `${BoldStart}diff --git a/${a.name} b/${b.name}\n`;

  if (status === FileStatusCode.DELETED) {
    str += `deleted file mode ${fileModeString.get(mode)}\n`;
    str += `index ${a.hash.substring(0, 7)}..${b.hash.substring(0, 7)}\n`;
  } else {
    str += `index ${a.hash.substring(0, 7)}..${b.hash.substring(
      0,
      7
    )} ${fileModeString.get(mode)}\n`;
  }

  const changes = createTwoFilesPatch(
    `a/${a.name}`,
    `b/${b.name}`,
    a.content,
    b.content
  );
  // Skip the first two lines from changes
  const split = changes.split(/\r\n|\n/).slice(1);

  // End bold lines in header
  split[1] = `${split[1]}${BoldEnd}`;

  // Add color to lines
  for (let i = 2; i < split.length; i++) {
    const line = split[i];
    if (
      line.substring(0, 2) === '@@' &&
      line.substring(line.length - 2, line.length) === '@@'
    ) {
      split[i] = `${FgCyan}${line}${ColorReset}`;
    } else if (line[0] === '+') {
      split[i] = `${FgGreen}${line}${ColorReset}`;
    } else if (line[0] === '-') {
      split[i] = `${FgRed}${line}${ColorReset}`;
    }
  }

  return str + split.join('\n');
}

export function gitDiff(gitRoot: string): string {
  // Get status of files
  const branch = getCurrentBranchName(gitRoot);
  const index = new IndexParser(gitRoot).parse();
  const files = getFileStatus(gitRoot, branch);

  let str = '';

  files.forEach((status) => {
    switch (status.worktree) {
      case FileStatusCode.UNMODIFIED:
      case FileStatusCode.UNTRACKED:
      case FileStatusCode.ADDED:
        break;
      case FileStatusCode.DELETED: {
        const e = index.getEntry(status.name)!;
        const gitObject = parseObject(gitRoot, e.hash);
        const a: FileInfo = {
          name: status.name,
          content: gitObject.data.toString(),
          hash: e.hash
        };

        const b: FileInfo = {
          name: '/dev/null',
          content: '',
          hash: ''.padStart(20, '0')
        };
        str += diffFile(a, b, status.worktree, e.mode);
        break;
      }
      case FileStatusCode.MODIFIED: {
        const e = index.getEntry(status.name)!;
        const gitObject = parseObject(gitRoot, e.hash);
        const a: FileInfo = {
          name: status.name,
          content: gitObject.data.toString(),
          hash: e.hash
        };

        const b: FileInfo = {
          name: status.name,
          content: fs.readFileSync(status.name, 'utf-8'),
          hash: hashObject({ gitRoot, file: status.name })
        };

        str += diffFile(a, b, status.worktree, e.mode);
        break;
      }
    }
  });

  return str;
}
