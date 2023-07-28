function heapSort(arr: string[]): string[] {
  const n = arr.length;

  // Build a heap from the given input array
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }

  // One by one extract an element from the heap
  for (let i = n - 1; i > 0; i--) {
    // move current to root
    const temp = arr[0];
    arr[0] = arr[i];
    arr[i] = temp;

    // Perform heapify to make the array an heap again
    heapify(arr, i, 0);
  }
  return arr;
}

/**
 * This function performs the Heapify procedure with node i as the root
 *
 * @param {string[]} arr
 * @param {number} n - Size of arr
 * @param {number} i
 */
function heapify(arr: string[], n: number, i: number) {
  let largest = i; // Initialize the largest as root
  const l = 2 * i + 1;
  const r = 2 * i + 2;

  // If the left child is largest
  if (l < n && arr[l] > arr[largest]) {
    largest = l;
  }

  // If the right child is largest
  if (r < n && arr[r] > arr[largest]) {
    largest = r;
  }

  // If largest is not root
  if (largest !== i) {
    const temp = arr[i];
    arr[i] = arr[largest];
    arr[largest] = temp;

    // Recursively heapify the affected sub-tree
    heapify(arr, n, largest);
  }
}

export { heapSort };
