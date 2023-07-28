/**
 * This function returns the UTF16 char code of the character (if present).
 * Otherwise returns 0.
 *
 * @param {string} str
 * @param {number} pos
 * @returns {number}
 */
function getCharCode(str: string, pos: number): number {
  if (pos < str.length) {
    return str.charCodeAt(pos);
  }
  return 0;
}

/**
 * Returns the length of the longest string present in the array
 *
 * @param {string[]} arr
 * @returns {number}
 */
function findMaxLength(arr: string[]): number {
  let ans = -1;
  for (let i = 0; i < arr.length; i++) {
    ans = Math.max(ans, arr[i].length);
  }
  return ans;
}

function countingSort(arr: string[], pos: number): string[] {
  const count: number[] = Array(65536).fill(0);
  const sortedArr: string[] = Array(arr.length); // Sorted final array

  // Store count of occurrences in count[]
  for (let i = 0; i < arr.length; i++) {
    const index = getCharCode(arr[i], pos);
    count[index]++;
  }

  // Change count[i] so that it now contains
  // the actual position of this character in sortedArr
  for (let i = 1; i < count.length; i++) {
    count[i] += count[i - 1];
  }

  // Build the sortedArr
  for (let i = arr.length - 1; i >= 0; i--) {
    const index = getCharCode(arr[i], pos);
    sortedArr[count[index] - 1] = arr[i];
    count[index]--;
  }
  // return the array
  return sortedArr;
}

function radixSort(arr: string[]): string[] {
  // Find the maximum length of string
  const maxLength = findMaxLength(arr);

  // Perform counting sort for every character.
  for (let i = maxLength - 1; i >= 0; i--) {
    arr = countingSort(arr, i);
  }

  return arr;
}

export { radixSort };
