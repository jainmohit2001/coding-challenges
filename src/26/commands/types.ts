import { EntryType, Stage } from './enums';

export type GitObjectType = 'blob' | 'commit' | 'tree' | 'tag';

// https://github.com/go-git/go-git/blob/809f9df1b76258a311a20c76d346e86aca0a08f8/plumbing/format/index/index.go#L126
export interface IndexEntry {
  ctimeSec: number;
  ctimeNanoFrac: number;
  mtimeSec: number;
  mtimeNanoFrac: number;
  dev: number;
  ino: number;
  type: EntryType;
  uid: number;
  gid: number;
  size: number;
  hash: string;
  name: string;
  stage: Stage;
  skipWorkTree: boolean;
  intentToAdd: boolean;
}
