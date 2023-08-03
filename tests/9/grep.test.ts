import { execSync } from 'child_process';
import { grep } from '../../src/9/grep';

describe('Testing grep', () => {
  test('Testing empty expression', () => {
    const expression = '';
    const filePath = './tests/9/files/test.txt';

    const expectedOutput = execSync(
      `grep "${expression}" ${filePath}`
    ).toString();
    const output = grep(expression, filePath);

    expect(output).toBe(expectedOutput);
  });

  test('Testing simple pattern', () => {
    const expression = 'J';
    const filePath = './tests/9/files/rockbands.txt';

    const expectedOutput = execSync(`grep "${expression}" ${filePath}`)
      .toString()
      .replace('\r\n', '\n')
      .trim();

    const output = grep(expression, filePath)?.trim();

    expect(output).toBe(expectedOutput);
  });

  test('Testing recursion of a directory tree', () => {
    const expression = 'Nirvana';
    const filePath = './tests/9/files';

    const expectedOutput = execSync(`grep -r "${expression}" ${filePath}`)
      .toString()
      .replace('\r\n', '\n')
      .trim();

    const output = grep(expression, filePath)?.trim();

    expect(output).toBe(expectedOutput);
  });

  test('Testing -v options', () => {
    const expression = 'Madonna';
    const filePath = './tests/9/files/rockbands.txt';

    const expectedOutput = execSync(`grep -v "${expression}" ${filePath}`)
      .toString()
      .replace('\r\n', '\n')
      .trim();
    const output = grep(expression, filePath, true)?.trim();

    expect(output).toBe(expectedOutput);
  });

  test('Testing \\d option', () => {
    const expression = '\\d';
    const filePath = './tests/9/files/test-subdir/BFS1985.txt';

    const expectedOutput = execSync(`grep -P "\\d" ${filePath}`)
      .toString()
      .replace('\r\n', '\n')
      .trim();
    const output = grep(expression, filePath)?.trim();

    expect(output).toBe(expectedOutput);
  });

  test('Testing \\w option', () => {
    const expression = '\\w';
    const filePath = './tests/9/files/symbols.txt';

    const expectedOutput = execSync(`grep -P "\\w" ${filePath}`)
      .toString()
      .replace('\r\n', '\n')
      .trim();
    const output = grep(expression, filePath)?.trim();

    expect(output).toBe(expectedOutput);
  });

  test('Testing ^ character matching', () => {
    const expression = '^A';
    const filePath = './tests/9/files/rockbands.txt';

    const expectedOutput = execSync(`grep "${expression}" ${filePath}`)
      .toString()
      .replace('\r\n', '\n')
      .trim();
    const output = grep(expression, filePath)?.trim();

    expect(output).toBe(expectedOutput);
  });

  test('Testing $ character matching', () => {
    const expression = 'na$';
    const filePath = './tests/9/files/rockbands.txt';

    const expectedOutput = execSync(`grep "${expression}" ${filePath}`)
      .toString()
      .replace('\r\n', '\n')
      .trim();
    const output = grep(expression, filePath)?.trim();

    expect(output).toBe(expectedOutput);
  });

  test('Testing -i option', () => {
    const expression = 'A';
    const filePath = './tests/9/files/rockbands.txt';

    const expectedOutput = execSync(`grep -i ${expression} ${filePath}`)
      .toString()
      .replace('\r\n', '\n')
      .trim();
    const output = grep(expression, filePath, undefined, true)?.trim();

    expect(output).toBe(expectedOutput);
  });
});
