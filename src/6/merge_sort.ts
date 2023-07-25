function merge(arr1: string[], arr2: string[]): string[] {
  let i = 0,
    j = 0;
  const n = arr1.length,
    m = arr2.length;
  const newArray: string[] = [];
  while (i < n && j < m) {
    if (arr1[i] <= arr2[j]) {
      newArray.push(arr1[i]);
      i++;
    } else if (arr1[i] > arr2[j]) {
      newArray.push(arr2[j]);
      j++;
    }
  }
  while (i < n) {
    newArray.push(arr1[i]);
    i++;
  }
  while (j < m) {
    newArray.push(arr2[j]);
    j++;
  }
  return newArray;
}

function mergeSort(arr: string[]): string[] {
  if (arr.length <= 1) {
    return arr;
  }

  if (arr.length == 2) {
    if (arr[0] > arr[1]) {
      return [arr[1], arr[0]];
    }
    return arr;
  }

  const idx = Math.floor(arr.length / 2);

  const left = mergeSort(arr.slice(0, idx));
  const right = mergeSort(arr.slice(idx));

  return merge(left, right);
}

export { mergeSort };
