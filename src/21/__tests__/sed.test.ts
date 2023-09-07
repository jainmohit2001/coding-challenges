import { spawn } from 'child_process';
import path from 'path';

const PATH_TO_SED_JS = './build/21/sed.js';

describe('Testing invalid arguments', () => {
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

describe('Testing step 1', () => {
  it('should replace all occurrences', (done) => {
    const pattern = 's/a/b/';
    const filename = path.join(__dirname, 'text.txt');
    const sed = spawn('node', [PATH_TO_SED_JS, pattern, filename]);
    let output = '';
    sed.stdout.on('data', (data) => {
      output += data.toString();
    });
    expect(output).not.toContain('a');
    done();
  });
});
