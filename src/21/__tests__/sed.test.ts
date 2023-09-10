import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { randomBytes } from 'crypto';

const PATH_TO_SED_JS = './build/21/sed.js';
const filename = path.join(__dirname, 'test.txt');

describe('Testing invalid args', () => {
  const args = [
    [PATH_TO_SED_JS],
    [PATH_TO_SED_JS, 'invalid-pattern', 'invalid-file.txt']
  ];

  args.forEach((arg) => {
    it('should print usage for args: ' + args.toString(), (done) => {
      const sed = spawn('node', arg);
      let output = '';

      sed.stdout.on('data', (data) => {
        output += data.toString();
      });

      sed.on('close', () => {
        expect(output).toContain('Usage');
        done();
      });
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

  it('should print "Invalid pattern or range"', (done) => {
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
      expect(output).toContain('Invalid pattern or range');
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

describe('Testing valid args', () => {
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
    content.split(/\r\n|\n/).forEach((line) => {
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

  it('should double space the file correctly', (done) => {
    const content = fs.readFileSync(filename).toString();
    const expectedOutput = content.replaceAll(/\r\n|\n/g, '\r\n\r\n');
    const sed = spawn('node', [PATH_TO_SED_JS, 'G', filename]);

    let output = '';

    sed.stdout.on('data', (data) => {
      output += data.toString();
    });

    sed.on('close', () => {
      expect(output).toBe(expectedOutput);
      done();
    });
  });

  it('should remove trailing blank lines from a file', (done) => {
    const content = 'content\r\nsome more content    ';
    const tmpfile = path.join(os.tmpdir(), 'temp-file.txt');
    fs.writeFileSync(tmpfile, content + '\r\n\r\n\r\n');
    const sed = spawn('node', [PATH_TO_SED_JS, '/^$/d', tmpfile]);

    let output = '';

    sed.stdout.on('data', (data) => {
      output += data.toString();
    });

    sed.on('close', () => {
      expect(output).toBe(content.trimEnd());
      done();
    });
  });

  it('should support -i option', (done) => {
    // First create a random test file from the `test.txt`
    const tempTextFile = path.join(__dirname, randomBytes(8).toString('hex'));
    fs.writeFileSync(tempTextFile, fs.readFileSync(filename));

    // Prepare args
    const stringToReplace = 'Life';
    const stringToReplaceWith = 'Code';
    const characterReplacementInput = `s/${stringToReplace}/${stringToReplaceWith}/g`;

    const initialContent = fs.readFileSync(tempTextFile).toString();
    const expectedContent = initialContent.replaceAll(
      stringToReplace,
      stringToReplaceWith
    );

    const sed = spawn('node', [
      PATH_TO_SED_JS,
      '-i',
      characterReplacementInput,
      tempTextFile
    ]);

    sed.on('close', () => {
      const finalContent = fs.readFileSync(tempTextFile).toString();
      // Unlink random test file
      fs.unlinkSync(tempTextFile);

      expect(finalContent).toBe(expectedContent);
      done();
    });
  });
});
