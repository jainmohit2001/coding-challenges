import { myWC } from '../../src/1/wc';
const { execSync } = require('child_process');
const fs = require('fs');

const filePaths = ['./tests/1/test1.txt', './tests/1/test2.txt'];

describe('Testing with filenames', () => {
  filePaths.forEach((filePath) => {
    const output = execSync(`wc ${filePath}`)
      .toString()
      .trim()
      .replace(/ +(?= )/g, '')
      .split(' ');
    // Sample output - 0 0 0 ./tests/1/test1.txt

    const l = output[0];
    const w = output[1];
    const c = output[2];

    test(`-l option ${filePath}`, () => {
      const argv = [' ', ' ', '-l', filePath];
      expect(myWC(argv, undefined)).resolves.toBe(`${l} ${filePath}`);
    });

    test(`-w option ${filePath}`, () => {
      const argv = [' ', ' ', '-w', filePath];
      expect(myWC(argv, undefined)).resolves.toBe(`${w} ${filePath}`);
    });

    test(`-c option ${filePath}`, () => {
      const argv = [' ', ' ', '-c', filePath];
      expect(myWC(argv, undefined)).resolves.toBe(`${c} ${filePath}`);
    });

    test(`No command option ${filePath}`, () => {
      const argv = [' ', ' ', filePath];
      expect(myWC(argv, undefined)).resolves.toBe(`${l} ${w} ${c} ${filePath}`);
    });
  });
});

describe('Testing without filename', () => {
  // No option is provided
  filePaths.forEach((filePath) => {
    const output = execSync(`cat ${filePath} | wc`)
      .toString()
      .trim()
      .replace(/ +(?= )/g, '')
      .split(' ');
    // Sample output - 0 0 0 ./tests/1/test1.txt

    const l = output[0];
    const w = output[1];
    const c = output[2];

    test(`-l option ${filePath}`, async () => {
      const stream = fs.createReadStream(filePath);
      const argv = [' ', ' ', '-l'];
      const result = await myWC(argv, stream);
      stream.destroy();
      expect(result).toBe(l);
    });

    test(`-w option ${filePath}`, async () => {
      const stream = fs.createReadStream(filePath);
      const argv = [' ', ' ', '-w'];
      const result = await myWC(argv, stream);
      stream.destroy();
      expect(result).toBe(w);
    });

    test(`-c option ${filePath}`, async () => {
      const stream = fs.createReadStream(filePath);
      const argv = [' ', ' ', '-c'];
      const result = await myWC(argv, stream);
      stream.destroy();
      expect(result).toBe(c);
    });

    test(`No option ${filePath}`, async () => {
      const stream = fs.createReadStream(filePath);
      const argv = [' ', ' '];
      const result = await myWC(argv, stream);
      stream.destroy();
      expect(result).toBe(`${l} ${w} ${c}`);
    });
  });
});

describe('Invalid inputs or invalid file', () => {
  const filename = filePaths[0];
  test('Invalid option with valid file and no stream', async () => {
    const argv = [' ', ' ', '-x', filename];
    expect(myWC(argv, undefined)).rejects.toThrow(new Error('Invalid option'));
  });

  test('Valid option with invalid file and no stream', async () => {
    const argv = [' ', ' ', '-l', 'invalid.txt'];
    expect(myWC(argv, undefined)).rejects.toThrow(new Error('Invalid file'));
  });

  test('Invalid file and no stream', async () => {
    const argv = [' ', ' ', '-x'];
    expect(myWC(argv, undefined)).rejects.toThrow(new Error('Invalid file'));
  });

  test('Invalid option with valid file and stream', async () => {
    const stream = fs.createReadStream(filename);
    const argv = [' ', ' ', '-x', filename];
    await expect(myWC(argv, stream)).rejects.toThrow(
      new Error('Invalid option')
    );
    stream.destroy();
  });

  test('Invalid option with valid stream and no filename', async () => {
    const stream = fs.createReadStream(filename);
    const argv = [' ', ' ', '-x'];
    await expect(myWC(argv, stream)).rejects.toThrow(
      new Error('Invalid option')
    );
    stream.destroy();
  });

  test('No option no file and no stream', async () => {
    const argv = [' ', ' '];
    expect(myWC(argv, undefined)).rejects.toThrow(
      new Error('Invalid input or file')
    );
  });
});
