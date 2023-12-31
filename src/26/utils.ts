import { globSync } from 'glob';
import { FileMode } from './enums';
import { FileStats, GitObject, GitObjectType } from './types';
import fs from 'fs';
import path from 'path';
import {
  DEFAULT_IGNORE_PATTERNS,
  NULL,
  PATH_TO_GIT_CONFIG,
  RELATIVE_PATH_TO_HEAD_FILE,
  RELATIVE_PATH_TO_OBJECT_DIR,
  RELATIVE_PATH_TO_REF_HEADS_DIR,
  SHA1Regex,
  SPACE
} from './constants';
import zlib from 'zlib';
import ini from 'ini';
import { Signature } from './objects/signature';

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
 * Returns a list of files present in `cwd`.
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
    .toString()
    .trim();
  const contentSplit = content.split('/');
  return contentSplit[contentSplit.length - 1];
}

/**
 * Looks up the reference to the head of the given branch name.
 * Returns the contents of the reference, i.e., the hash of the commit object.
 *
 * @export
 * @param {string} gitRoot
 * @param {string} branch
 * @returns {(string | undefined)}
 */
export function getBranchHeadReference(
  gitRoot: string,
  branch: string
): string | undefined {
  const pathToRef = path.join(gitRoot, RELATIVE_PATH_TO_REF_HEADS_DIR, branch);

  if (!fs.existsSync(pathToRef)) {
    return undefined;
  }

  return fs.readFileSync(pathToRef).toString().trim();
}

/**
 * Extracts user information from .gitconfig file.
 *
 * @export
 * @returns {Signature}
 */
export function getSignature(): Signature {
  const config = ini.parse(fs.readFileSync(PATH_TO_GIT_CONFIG, 'utf-8'));
  if (!config.user.name || !config.user.email) {
    throw new Error('No valid name or email found!');
  }
  return new Signature(config.user.name, config.user.email, new Date());
}

/**
 * Check if an object exists in the .git/objects DIR with given hash and type.
 *
 * @export
 * @param {string} gitRoot
 * @param {string} hash Hash value of the object (substring also supported).
 * @param {GitObjectType} type
 * @returns {string} Complete hash of the object
 */
export function verifyObject(
  gitRoot: string,
  hash: string,
  type: GitObjectType
): string {
  const subdir = hash.substring(0, 2);
  const cwd = path.join(gitRoot, RELATIVE_PATH_TO_OBJECT_DIR, subdir);

  const files = globSync(`${hash.substring(2, hash.length)}*`, {
    cwd,
    nodir: true
  });

  if (files.length !== 1) {
    throw new Error(`fatal: ${hash} is not a valid object`);
  }

  const pathToFile = path.join(cwd, files[0]);
  const fileContents = zlib.unzipSync(fs.readFileSync(pathToFile));

  // Read the header
  let i = 0;
  for (i; i < fileContents.length; i++) {
    if (fileContents[i] === NULL) {
      break;
    }
  }
  const header = fileContents.subarray(0, i).toString();

  // Cross check the type of the object
  if (header.indexOf(type) === 0) {
    // Return the full hash of the object
    return `${subdir}${files[0]}`;
  }

  throw new Error(`fatal: ${hash} is not a valid object`);
}

export function isValidSHA1(s: string): boolean {
  return !!SHA1Regex.exec(s);
}

/**
 * This function parses header buffer from an object file and returns:
 * - the type of object
 * - byte length of the data
 * 
 * @export
 * @param {Buffer} buffer
 * @returns {{
  type: GitObjectType;
  length: number;
}}
 */
export function parseObjectHeader(buffer: Buffer): {
  type: GitObjectType;
  length: number;
} {
  // Format of header:
  // <type><SPACE><length-in-bytes>
  let i = 0;
  while (buffer[i] !== SPACE && i < buffer.byteLength) {
    i++;
  }

  const headerType = buffer.subarray(0, i).toString() as GitObjectType;
  i++;
  const headerLength = parseInt(buffer.subarray(i).toString());

  return { type: headerType, length: headerLength };
}

/**
 * Given a path to an object, this function parses it and returns:
 * - the object type,
 * - the byte length of the data,
 * - the data
 *
 * Note: This function only looks up the objects stored inside .git/objects.
 * Pack files are excluded from the lookup.
 *
 * This could cause issues since GIT performs Garbage collection (GC)
 * to reduce the size of the data stored under the .git/objects dir which
 * results in removal of original objects directly referenced via hash values.
 * (https://git-scm.com/book/en/v2/Git-Internals-Packfiles)
 *
 * @export
 * @param {string} gitRoot
 * @param {string} hash
 * @returns {GitObject}
 */
export function parseObject(gitRoot: string, hash: string): GitObject {
  const pathToFile = path.join(
    gitRoot,
    RELATIVE_PATH_TO_OBJECT_DIR,
    hash.substring(0, 2),
    hash.substring(2, hash.length)
  );

  if (!isValidSHA1(hash) || !fs.existsSync(pathToFile)) {
    throw new Error(
      `fatal: ${hash} no such object exists.\nThe object might be present in packfile present under .git/objects/pack. This is currently not supported.`
    );
  }

  // Unzip the content
  const fileContents = zlib.unzipSync(fs.readFileSync(pathToFile));

  // The header is present till we found a NULL character
  let i = 0;
  while (i < fileContents.length && fileContents[i] !== NULL) {
    i++;
  }
  const header = parseObjectHeader(fileContents.subarray(0, i));
  return { ...header, data: fileContents.subarray(i + 1) };
}
