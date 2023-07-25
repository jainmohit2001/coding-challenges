function getCharCode(str: string, pos: number): number {
  if (pos < str.length) {
    return str.charCodeAt(pos);
  }
  return 0;
}

function findMaxLength(arr: string[]): number {
  let ans = -1;
  for (let i = 0; i < arr.length; i++) {
    ans = Math.max(ans, arr[i].length);
  }
  return ans;
}

function countingSort(arr: string[], pos: number): string[] {
  const count: number[] = Array(65536).fill(0);
  const sortedArr: string[] = Array(arr.length);

  for (let i = 0; i < arr.length; i++) {
    const index = getCharCode(arr[i], pos);
    count[index]++;
  }

  for (let i = 1; i < count.length; i++) {
    count[i] += count[i - 1];
  }

  for (let i = arr.length - 1; i >= 0; i--) {
    const index = getCharCode(arr[i], pos);
    sortedArr[count[index] - 1] = arr[i];
    count[index]--;
  }
  return sortedArr;
}

function radixSort(arr: string[]): string[] {
  const maxLength = findMaxLength(arr);

  for (let i = maxLength - 1; i >= 0; i--) {
    arr = countingSort(arr, i);
  }

  return arr;
}

export { radixSort };
