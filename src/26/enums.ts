export enum Stage {
  ZERO = 0,
  MERGED = 1,
  OUR_MODE = 2,
  THEIR_MODE = 3
}

// https://git-scm.com/docs/index-format
export enum EntryType {
  REGULAR = 0b1000,
  SYMBOLIC_LINK = 0b1010,
  GITLINK = 0b1110
}
