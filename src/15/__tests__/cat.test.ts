import { ChildProcessWithoutNullStreams, execSync, spawn } from 'child_process';
import path from 'path';

/**
 * This is a helper function which waits for the program to finish,
 * and checks the output with the expected output.
 *
 * @param {ChildProcessWithoutNullStreams} catTool - cat program process
 * @param {string} expectedOutput - output we got from execSync command
 * @param {jest.DoneCallback} done - used to wait for the test to complete
 * @param {boolean} debug - used for debugging purposes
 */
function catToolStdoutChecker(
  catTool: ChildProcessWithoutNullStreams,
  expectedOutput: string,
  done: jest.DoneCallback,
  debug: boolean = false
) {
  catTool.on('error', () => {});
  catTool.stderr.on('data', () => {});
  let finalData = '';

  catTool.stdout.on('data', (data) => {
    if (debug) {
      console.log(data);
    }
    finalData += data.toString();
  });

  catTool.on('close', () => {
    expect(finalData).toStrictEqual(expectedOutput);
    done();
  });
}

const pathToCatJs = './build/src/15/cat.js';

describe('Testing cat tool', () => {
  let catTool: ChildProcessWithoutNullStreams;
  const testFile1 = path.join(__dirname, 'test1.txt');
  const testFile2 = path.join(__dirname, 'test2.txt');
  const testFile3 = path.join(__dirname, 'test3.txt');

  afterEach(() => {
    catTool.kill('SIGINT');
  });

  it('Should output when provided a valid file', (done) => {
    const expectedOutput = execSync('cat ' + testFile1).toString();

    catTool = spawn('node', [pathToCatJs, testFile1]);

    catToolStdoutChecker(catTool, expectedOutput, done);
  });

  it('Should handle input from stdin', (done) => {
    const expectedOutput = execSync(`head -n1 ${testFile1} | cat -`).toString();

    catTool = spawn('node', [pathToCatJs, '-']);

    catToolStdoutChecker(catTool, expectedOutput, done);

    catTool.stdin.write(execSync(`head -n1 ${testFile1}`));
    catTool.stdin.end();
  });

  it('Should concatenate files', (done) => {
    const expectedOutput = execSync(`cat ${testFile1} ${testFile2}`).toString();

    catTool = spawn('node', [pathToCatJs, testFile1, testFile2]);

    catToolStdoutChecker(catTool, expectedOutput, done);
  });

  [testFile1, testFile3].forEach((file) => {
    it(`Should number the lines from stdin - ${file}`, (done) => {
      const expectedOutput = execSync(`head -n3 ${file} | cat -n`)
        .toString()
        .split(/\r\n|\n/)
        .join('\r\n');

      catTool = spawn('node', [pathToCatJs, '-n']);

      catToolStdoutChecker(catTool, expectedOutput, done);

      catTool.stdin.write(execSync(`head -n3 ${file}`));
      catTool.stdin.end();
    });
  });

  it(`Should exclude numbers from blank lines in stdin`, (done) => {
    const expectedOutput = execSync(`head -n3 ${testFile3} | cat -b`)
      .toString()
      .split(/\r\n|\n/)
      .join('\r\n');

    catTool = spawn('node', [pathToCatJs, '-b']);

    catToolStdoutChecker(catTool, expectedOutput, done);

    catTool.stdin.write(execSync(`head -n3 ${testFile3}`));
    catTool.stdin.end();
  });
});
