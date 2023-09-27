import { FileMode } from './enums';
import { GitObjectType } from './types';

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
