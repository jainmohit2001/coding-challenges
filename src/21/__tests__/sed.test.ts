import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const PATH_TO_SED_JS = './build/21/sed.js';
const filename = path.join(__dirname, 'test.txt');

describe('Testing invalid arguments for character replacement', () => {
  it('should print usage', (done) => {
    const sed = spawn('node', [PATH_TO_SED_JS]);
    let output = '';

    sed.stdout.on('data', (data) => {
      output += data.toString();
    });

    sed.on('close', () => {
      expect(output).toContain('Usage');
      done();
    });
  });

  it('should print invalid pattern', (done) => {
    const sed = spawn('node', [PATH_TO_SED_JS, 'invalid-pattern', '']);
    let output = '';

    sed.stderr.on('data', (data) => {
      output += data.toString();
    });

    sed.on('close', () => {
      expect(output).toContain('Invalid pattern');
      done();
    });
  });

  it('should print invalid file with valid pattern', (done) => {
    const sed = spawn('node', [
      PATH_TO_SED_JS,
      's/this/that/',
      'invalid-file.txt'
    ]);

    let output = '';
    sed.stderr.on('data', (data) => {
      output += data.toString();
    });

    sed.on('close', () => {
      expect(output).toContain('Invalid file');
      done();
    });
  });
});

describe('Testing invalid arguments for range of lines', () => {
  it('should print invalid range', (done) => {
    const sed = spawn('node', [
      PATH_TO_SED_JS,
      '-n',
      '2,4',
      'invalid-file.txt'
    ]);
    let output = '';

    sed.stderr.on('data', (data) => {
      output += data.toString();
    });

    sed.on('close', () => {
      expect(output).toContain('Invalid range');
      done();
    });
  });

  it('should print invalid file with valid range', (done) => {
    const sed = spawn('node', [
      PATH_TO_SED_JS,
      '-n',
      '2,4p',
      'invalid-file.txt'
    ]);
    let output = '';

    sed.stderr.on('data', (data) => {
      output += data.toString();
    });

    sed.on('close', () => {
      expect(output).toContain('Invalid file');
      done();
    });
  });
});

describe('Testing character replacement', () => {
  it('should replace all occurrences', (done) => {
    const pattern = 's/a/b/';
    const content = fs.readFileSync(filename).toString();
    const expectedOutput = content.replaceAll('a', 'b');

    const sed = spawn('node', [PATH_TO_SED_JS, pattern, filename]);
    let output = '';

    sed.stdout.on('data', (data) => {
      output += data.toString();
    });

    sed.on('close', () => {
      expect(output).toBe(expectedOutput);
      done();
    });
  });
});

describe('Testing range of lines', () => {
  it('should print only lines mentioned', (done) => {
    const [start, end] = [2, 4];
    const range = `${start},${end}p`;
    const content = fs.readFileSync(filename).toString();
    const expectedOutput = content
      .split(/\r\n|\n/)
      .slice(start, end + 1)
      .join('\r\n');

    const sed = spawn('node', [PATH_TO_SED_JS, '-n', range, filename]);
    let output = '';

    sed.stdout.on('data', (data) => {
      output += data.toString();
    });

    sed.on('close', () => {
      expect(output).toBe(expectedOutput);
      done();
    });
  });

  it('should print line containing the specific pattern only', (done) => {
    const pattern = 'roads';
    const content = fs.readFileSync(filename).toString();
    const expectedOutput: string[] = [];
    content.split(/\r\n|\rn/).forEach((line) => {
      if (line.indexOf(pattern) >= 0) {
        expectedOutput.push(line);
      }
    });
    const sed = spawn('node', [
      PATH_TO_SED_JS,
      '-n',
      `/${pattern}/p`,
      filename
    ]);

    let output = '';

    sed.stdout.on('data', (data) => {
      output += data.toString();
    });

    sed.on('close', () => {
      expect(output).toBe(expectedOutput.join('\r\n'));
      done();
    });
  });
});
