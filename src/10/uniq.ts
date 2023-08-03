import fs from 'fs';

/**
 * Input Interface for uniq function
 *
 * @interface IUniqInput
 * @typedef {IUniqInput}
 */
interface IUniqInput {
  path?: string;
  inStream?: NodeJS.ReadStream | fs.ReadStream;
  count?: boolean;
  repeated?: boolean;
  unique?: boolean;
}

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

async function uniq({
  path,
  inStream,
  count = false,
  repeated = false,
  unique = false
}: IUniqInput): Promise<string> {
  if (repeated && unique) {
    throw new Error('Both -u and -d option cannot be present');
  }
  let input = '';

  if (path !== undefined) {
    input = fs.readFileSync(path).toString().trim();
  } else if (inStream !== undefined) {
    input = (await readStream(inStream)).toString();
  } else {
    throw new Error('No file or stream provided');
  }

  const lines = input.split(/\r\n|\r|\n/);

  const uniqLines = new Map<string, number>();
  lines.forEach((line) => {
    if (uniqLines.has(line)) {
      uniqLines.set(line, uniqLines.get(line)! + 1);
    } else {
      uniqLines.set(line, 1);
    }
  });

  const output: string[] = [];

  uniqLines.forEach((value, key) => {
    // We are checking for the various parameters
    // and pushing the relevant string into the output array.
    if (unique && value === 1 && !count) {
      output.push(key);
      return;
    }

    if (unique && value === 1 && count) {
      output.push(`${value} ${key}`);
      return;
    }

    if (unique && value > 1) {
      return;
    }

    if (repeated && value <= 1) {
      return;
    }

    if (count) {
      output.push(`${value} ${key}`);
      return;
    }

    output.push(key);
  });

  return output.join('\n');
}

export { uniq };
