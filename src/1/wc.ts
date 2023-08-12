import fs from 'fs';

/**
 * This function Reads the given stream and returns a Buffer.
 *
 * @async
 * @param {NodeJS.ReadStream} stream
 * @returns {Promise<Buffer>}
 */
async function readStream(
  stream: NodeJS.ReadStream | fs.ReadStream
): Promise<Buffer> {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

/**
 * This function returns the number of bytes consisting the given file.
 *
 * @param {string} filename
 * @returns {number}
 */
function byteCount(filename: string): number {
  return fs.statSync(filename).size;
}

/**
 * This function returns the number of lines in a given text.
 *
 * @param {string} text
 * @returns {number}
 */
function lineCount(text: string): number {
  return text.split(/\r\n|\r|\n/).length - 1;
}

/**
 * This function returns the number of words stored in a text.
 *
 * @param {string} text
 * @returns {number}
 */
function wordCount(text: string): number {
  if (text.length <= 0) {
    return 0;
  }
  return text.trim().split(/\s+/).length;
}

/**
 * This function returns the number of characters in a given text.
 *
 * @param {string} text
 * @returns {number}
 */
function charCount(text: string): number {
  return text.length;
}

/**
 * This function is the unix wc command implementation
 *
 * @async
 * @param {string[]} argv - The first two are reserved arguments considering the
 *      node call to the file
 * @param {?NodeJS.ReadStream | fs.ReadStream } [stream] - This can be a file read stream or the
 *      stdin stream
 * @returns {Promise<string>}
 */
async function myWC(
  argv: string[],
  stream?: NodeJS.ReadStream | fs.ReadStream
): Promise<string> {
  // Option is given, file is given
  if (argv.length === 4) {
    // console.log('file + option');
    const option = argv[2];
    const filename = argv[3];
    if (fs.existsSync(filename)) {
      const fileContents = fs.readFileSync(filename, 'utf8').toString();
      switch (option) {
        case '-c':
          return byteCount(filename).toString() + ' ' + filename;
        case '-l':
          return lineCount(fileContents).toString() + ' ' + filename;
        case '-w':
          return wordCount(fileContents).toString() + ' ' + filename;
        case '-m':
          return charCount(fileContents) + ' ' + filename;
        default:
          throw new Error('Invalid option');
      }
    }
    if (typeof stream === 'undefined') {
      throw new Error('Invalid file');
    }
  }

  // Only filename is given
  if (argv.length === 3) {
    // console.log('only option');
    const filename = argv[2];
    if (fs.existsSync(filename)) {
      const fileContents = fs.readFileSync(filename, 'utf8');
      const line = lineCount(fileContents).toString();
      const word = wordCount(fileContents).toString();
      const bytes = byteCount(filename).toString();
      return line + ' ' + word + ' ' + bytes + ' ' + filename;
    }
    if (typeof stream === 'undefined') {
      throw new Error('Invalid file');
    }
  }

  // Checking for stream
  if (typeof stream !== 'undefined') {
    // console.log('stream');
    try {
      // If option is given
      const buffer = await readStream(stream);
      const fileContents = buffer.toString();
      if (argv.length === 3) {
        const option = argv[2];
        switch (option) {
          case '-c':
            return buffer.length.toString();
          case '-l':
            return lineCount(fileContents).toString();
          case '-w':
            return wordCount(fileContents).toString();
          case '-m':
            return charCount(fileContents).toString();
          default:
            throw new Error('Invalid option');
        }
      }

      // If no option is given
      if (argv.length == 2) {
        const line = lineCount(fileContents).toString();
        const word = wordCount(fileContents).toString();
        const bytes = buffer.length.toString();
        return line + ' ' + word + ' ' + bytes;
      }
    } catch (err) {
      // If the error is not an expected TypeError
      if (!(err instanceof TypeError)) {
        throw err;
      }
    }
  }
  throw new Error('Invalid input or file');
}

export { myWC };
