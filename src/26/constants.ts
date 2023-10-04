import path from 'path';

export const NULL = Buffer.from('\0')[0];
export const SPACE = Buffer.from(' ')[0];
export const LF = Buffer.from('\n')[0];

export const SHA1Regex = /^[a-fA-F0-9]{40}$/;

export const RELATIVE_PATH_TO_INDEX_FILE = '.git/index';
export const RELATIVE_PATH_TO_HEAD_FILE = '.git/HEAD';
export const RELATIVE_PATH_TO_OBJECT_DIR = '.git/objects';
export const RELATIVE_PATH_TO_REF_HEADS_DIR = '.git/refs/heads';
export const PATH_TO_GIT_CONFIG = path.join(
  (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) ?? '',
  '.gitconfig'
);
export const DEFAULT_IGNORE_PATTERNS = ['.git/**'];

export const PREFIX_SIZE = 62;
export const CTIME_OFFSET = 0;
export const CTIME_NANO_OFFSET = 4;
export const MTIME_OFFSET = 8;
export const MTIME_NANO_OFFSET = 12;
export const DEV_OFFSET = 16;
export const INO_OFFSET = 20;
export const MODE_OFFSET = 24;
export const UID_OFFSET = 28;
export const GID_OFFSET = 32;
export const FILES_SIZE_OFFSET = 36;
export const HASH_OFFSET = 40;
export const FLAGS_OFFSET = 60;
export const NAME_OFFSET = 62;

export const FgGreen = '\x1b[32m';
export const ColorReset = '\x1b[0m';
export const FgRed = '\x1b[31m';
export const FgCyan = '\x1b[36m';
export const BoldStart = '\x1b[1m';
export const BoldEnd = `\x1b[22m`;
