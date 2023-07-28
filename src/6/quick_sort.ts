function swap(arr: string[], i: number, j: number) {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

function partition(arr: string[], left: number, right: number): number {
  // We are using the right most element as the pivot
  const pivot = arr[right];

  // This is the position where the pivot will eventually end up
  let swapIndex = left - 1;

  // Iterate over the arr partition and swap elements if required
  for (let i = left; i < right; i++) {
    if (arr[i] <= pivot) {
      swapIndex++;
      swap(arr, i, swapIndex);
    }
  }

  // Finally place the pivot in the right place
  swap(arr, swapIndex + 1, right);
  return swapIndex + 1;
}

function quicksort(
  arr: string[],
  left: number = 0,
  right: number = arr.length - 1
): string[] {
  if (left >= right) {
    return arr;
  }
  // Partition the array, this element is in the right place now
  const pivot = partition(arr, left, right);

  // Sort the left and right partitions and return the array
  quicksort(arr, left, pivot - 1);
  quicksort(arr, pivot + 1, right);
  return arr;
}

export { quicksort };
