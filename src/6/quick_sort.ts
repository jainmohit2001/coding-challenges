function swap(arr: string[], i: number, j: number) {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

function partition(arr: string[], left: number, right: number): number {
  const pivot = arr[right];
  let swapIndex = left - 1;
  for (let i = left; i < right; i++) {
    if (arr[i] <= pivot) {
      swapIndex++;
      swap(arr, i, swapIndex);
    }
  }
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
  const pivot = partition(arr, left, right);
  quicksort(arr, left, pivot - 1);
  quicksort(arr, pivot + 1, right);
  return arr;
}

export { quicksort };
