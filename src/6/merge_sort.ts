function merge(arr1: string[], arr2: string[]): string[] {
  let i = 0,
    j = 0;

  const n = arr1.length,
    m = arr2.length;

  const newArray: string[] = [];

  // Find the smallest of arr1[i] and arr2[j] and insert that into the array.
  // Increment i,j respectively.
  while (i < n && j < m) {
    if (arr1[i] <= arr2[j]) {
      newArray.push(arr1[i]);
      i++;
    } else if (arr1[i] > arr2[j]) {
      newArray.push(arr2[j]);
      j++;
    }
  }

  // Insert the rest of the elements of arr1
  while (i < n) {
    newArray.push(arr1[i]);
    i++;
  }

  // Insert the rest of the elements of arr2
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
    // Swap the elements and return the array
    if (arr[0] > arr[1]) {
      return [arr[1], arr[0]];
    }
    return arr;
  }

  // Find the mid of the array
  const idx = Math.floor(arr.length / 2);

  // Sort the left and right array
  const left = mergeSort(arr.slice(0, idx));
  const right = mergeSort(arr.slice(idx));

  // Merge the sorted arrays and return it
  return merge(left, right);
}

export { mergeSort };
