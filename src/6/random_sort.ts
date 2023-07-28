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
  const map = new Map<number, IStringHash>();

  for (let i = 0; i < arr.length; i++) {
    const hash = computeHash(arr[i]);
    if (!map.has(hash)) {
      map.set(hash, new StringHash(arr[i], 1, hash));
    } else {
      map.get(hash)!.incrementCount();
    }
  }

  const hashArr = shuffleArray([...map.keys()]);
  const newArray: string[] = [];

  for (let i = 0; i < hashArr.length; i++) {
    const hash = hashArr[i];
    if (map.has(hash)) {
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
