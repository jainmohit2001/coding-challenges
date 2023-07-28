interface IStringHash {
  str: string;
  count: number;
  hash: number;
  incrementCount(): number;
  decrementCount(): number;
}

class StringHash implements IStringHash {
  str: string;
  count: number;
  hash: number;

  constructor(str: string, count: number, hash: number) {
    this.str = str;
    this.count = count;
    this.hash = hash;
  }

  incrementCount(): number {
    this.count++;
    return this.count;
  }

  decrementCount(): number {
    this.count--;
    return this.count;
  }
}

/**
 * Computes the Hash value of a given string using
 * Polynomial Rolling Hash Function.
 *
 * @param {string} str
 * @returns {number}
 */
function computeHash(str: string): number {
  const prime = 31;
  const mod = 10e9 + 9;
  let hashValue = 0;
  let power = 1;
  for (let i = 0; i < str.length; i++) {
    const code = str.codePointAt(i);
    if (code !== undefined) {
      hashValue = (hashValue + code * power) % mod;
    }
    power = (power * prime) % mod;
  }
  return hashValue;
}

/**
 * Given an array of number, this function randomly shuffles it's content and
 * returns the new shuffled array.
 * @date 7/28/2023 - 6:12:23 PM
 *
 * @param {number[]} arr
 * @returns {number[]}
 */
function shuffleArray(arr: number[]): number[] {
  for (let i = 0; i < arr.length; i++) {
    // Generate random index to swap from
    const idx = Math.floor(Math.random() * (i + 1));

    const temp = arr[i];
    arr[i] = arr[idx];
    arr[idx] = temp;
  }
  return arr;
}

function randomSort(arr: string[]): string[] {
  // Storing hash value and corresponding information
  const map = new Map<number, IStringHash>();

  for (let i = 0; i < arr.length; i++) {
    const hash = computeHash(arr[i]);
    // If hash already exists
    if (!map.has(hash)) {
      map.set(hash, new StringHash(arr[i], 1, hash));
    }
    // Otherwise increment the count
    else {
      map.get(hash)!.incrementCount();
    }
  }

  const hashArr = shuffleArray([...map.keys()]); // Shuffle the hash values
  const newArray: string[] = [];

  for (let i = 0; i < hashArr.length; i++) {
    const hash = hashArr[i];
    if (map.has(hash)) {
      // Get the element and push the string `count` times
      const elem = map.get(hash)!;
      let count = elem.count;
      const str = elem.str;

      while (count > 0) {
        newArray.push(str);
        count--;
      }

      map.delete(hash);
    } else {
      // Should never happen
      throw new Error('Some error occurred');
    }
  }

  return newArray;
}

export { randomSort };
