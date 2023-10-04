import { SPACE, NULL } from '../constants';
import { fileModeString, fileType, parseObject } from '../utils';

interface CatFileArgs {
  /**
   * Absolute path to the root of the Git repo.
   *
   * @type {string}
   */
  gitRoot: string;

  /**
   * The hash value corresponding to the object.
   *
   * @type {string}
   */
  object: string;

  /**
   * Return the type only.
   *
   * @type {?boolean}
   */
  t?: boolean;

  /**
   * Return the content of the given object.
   *
   * @type {?boolean}
   */
  p?: boolean;
}

function parseTreeFile(data: Buffer): string {
  const output: string[] = [];

  for (let i = 0; i < data.length; ) {
    // Format of each entry:
    // <mode><SPACE><filename><NULL><hash>
    const modeStartPos = i;
    while (data[i] !== SPACE) {
      i++;
    }
    const mode = parseInt(data.subarray(modeStartPos, i).toString(), 8);
    i++;

    const filenameStartPos = i;
    while (data[i] !== NULL) {
      i++;
    }
    const filename = data.subarray(filenameStartPos, i).toString();
    i++;

    const hash = data.subarray(i, i + 20).toString('hex');
    i += 20;
    output.push(
      `${fileModeString.get(mode)} ${fileType.get(mode)} ${hash} ${filename}`
    );
  }

  return output.join('\r\n');
}

/**
 * Main function to perform the cat-file command.
 * Supported file types:
 * - blob
 * - tree
 *
 * @param {CatFileArgs} { gitRoot, object, t = false, p = false }
 * @returns {string}
 */
function catFile({
  gitRoot,
  object,
  t = false,
  p = false
}: CatFileArgs): string {
  // Make sure exact one option is provided
  if ((t && p) || (!t && !p)) {
    throw new Error('Invalid usage');
  }

  const gitObject = parseObject(gitRoot, object);

  // The user asked for `type` only
  if (t) {
    return gitObject.type;
  }

  // The user asked for contents of the file
  switch (gitObject.type) {
    case 'blob':
    case 'commit':
      return gitObject.data.toString();
    case 'tree':
      return parseTreeFile(gitObject.data);
  }

  throw new Error(`File ${gitObject.type} not supported`);
}

export default catFile;
