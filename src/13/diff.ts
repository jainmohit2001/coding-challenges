import fs from 'fs';

/**
 * Finds the longest common subsequence for given string s1 and s2.
 * Returns the inserted and deleted characters along with the lcs.
 *
 * @export
 * @param {string} s1
 * @param {string} s2
 * @returns {string[]} - [lcs, inserted characters, deleted characters]
 */
export function lcs(s1: string, s2: string): string[] {
  const m = s1.length;
  const n = s2.length;

  // Initialize LCS Table
  const lcsTable = new Array<Array<number>>(m + 1);
  for (let i = 0; i <= m; i++) {
    lcsTable[i] = new Array<number>(n + 1);
  }

  // Fill First column with zeroes
  for (let i = 0; i <= m; i++) {
    lcsTable[i][0] = 0;
  }

  // Fill first row with zeroes
  for (let j = 0; j <= n; j++) {
    lcsTable[0][j] = 0;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      // If both the characters match
      if (s1[i - 1] === s2[j - 1]) {
        lcsTable[i][j] = lcsTable[i - 1][j - 1] + 1;
      }
      // Choose the max of the neighbors
      else {
        lcsTable[i][j] = Math.max(lcsTable[i - 1][j], lcsTable[i][j - 1]);
      }
    }
  }

  // Find the LCS from the Table
  let str = '';
  let i = m,
    j = n;
  let inserted = '',
    deleted = '';

  while (i > 0 && j > 0) {
    // Include the character if both the characters are same
    if (s1[i - 1] == s2[j - 1]) {
      str = s1[i - 1] + str;
      i--;
      j--;
    }
    // Else move in the direction with greater value
    else {
      if (lcsTable[i][j - 1] > lcsTable[i - 1][j]) {
        inserted = s2[j - 1] + inserted;
        j--;
      } else {
        deleted = s1[i - 1] + deleted;
        i--;
      }
    }
  }

  while (i > 0) {
    deleted = s1[i - 1] + deleted;
    i--;
  }

  while (j > 0) {
    inserted = s2[j - 1] + inserted;
    j--;
  }

  return [str, inserted, deleted];
}

export function lcsArray(arr1: string[], arr2: string[]): string[][] {
  const m = arr1.length;
  const n = arr2.length;

  // Initialize LCS Table
  const lcsTable = new Array<Array<number>>(m + 1);
  for (let i = 0; i <= m; i++) {
    lcsTable[i] = new Array<number>(n + 1);
  }

  // Fill First column with zeroes
  for (let i = 0; i <= m; i++) {
    lcsTable[i][0] = 0;
  }

  // Fill first row with zeroes
  for (let j = 0; j <= n; j++) {
    lcsTable[0][j] = 0;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      // If both the strings match
      if (arr1[i - 1] === arr2[j - 1]) {
        lcsTable[i][j] = lcsTable[i - 1][j - 1] + 1;
      }
      // Choose the max of the neighbors
      else {
        lcsTable[i][j] = Math.max(lcsTable[i - 1][j], lcsTable[i][j - 1]);
      }
    }
  }

  // Find the LCS from the Table
  const str: string[] = [];
  let i = m,
    j = n;
  let insertions = new Array<{ index: number; str: string }>();
  let deletions = new Array<{ index: number; str: string }>();

  while (i > 0 && j > 0) {
    // Include the string if both the strings are same
    if (arr1[i - 1] === arr2[j - 1]) {
      str.push(arr1[i - 1]);
      i--;
      j--;
    }
    // Else move in the direction with greater value
    else {
      if (lcsTable[i][j - 1] > lcsTable[i - 1][j]) {
        insertions.push({ index: j - 1, str: '+ ' + arr2[j - 1] });
        j--;
      } else {
        deletions.push({ index: i - 1, str: '- ' + arr1[i - 1] });
        i--;
      }
    }
  }

  while (j > 0) {
    insertions.push({ index: j - 1, str: '+ ' + arr2[j - 1] });
    j--;
  }

  while (i > 0) {
    deletions.push({ index: i - 1, str: '- ' + arr1[i - 1] });
    i--;
  }

  const differences: string[] = [];

  insertions = insertions.reverse();
  deletions = deletions.reverse();

  let x = 0,
    y = 0;
  const length1 = insertions.length,
    length2 = deletions.length;

  while (x < length1 && y < length2) {
    if (deletions[y].index <= insertions[x].index) {
      differences.push(deletions[y].str);
      y++;
    } else {
      differences.push(insertions[x].str);
      x++;
    }
  }

  while (x < length1) {
    differences.push(insertions[x].str);
    x++;
  }

  while (y < length2) {
    differences.push(deletions[y].str);
    y++;
  }

  // We need to reverse the array of strings
  return [str.reverse(), differences];
}

export function diffBetweenFiles(path1: string, path2: string) {
  const arr1 = fs
    .readFileSync(path1)
    .toString()
    .split(/\r\n|\n/);

  const arr2 = fs
    .readFileSync(path2)
    .toString()
    .split(/\r\n|\n/);

  return lcsArray(arr1, arr2);
}
