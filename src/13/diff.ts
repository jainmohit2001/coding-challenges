export function lcs(s1: string, s2: string): string {
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

  while (i > 0 && j > 0) {
    // Include the character if both the characters are same
    if (s1[i - 1] == s2[j - 1]) {
      str += s1[i - 1];
      i--;
      j--;
    }
    // Else move in the direction with greater value
    else {
      if (lcsTable[i][j - 1] > lcsTable[i - 1][j]) {
        j--;
      } else {
        i--;
      }
    }
  }

  // We need to reverse the string
  return str.split('').reverse().join('');
}
