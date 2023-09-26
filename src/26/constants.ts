export const NULL = Buffer.from('\0')[0];
export const SPACE = Buffer.from(' ')[0];

export const SHA1Regex = /^[a-fA-F0-9]{40}$/;

export const PATH_TO_INDEX_FILE = './.git/index';
export const PATH_TO_HEAD_FILE = './.git/HEAD';

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
