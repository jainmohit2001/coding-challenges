import fs from 'fs';
import IndexParser from '../../indexParser';
import { createTempGitRepo } from '../../jestHelpers';
import { RELATIVE_PATH_TO_INDEX_FILE } from '../../constants';
import path from 'path';
import { randomBytes } from 'crypto';

describe('Testing indexParser', () => {
  const dir = path.join(__dirname, 'testFiles');
  const files = fs.readdirSync(dir);

  const gitRoot = createTempGitRepo();

  it('should throw error when invalid gitRoot is provided', () => {
    expect(() => new IndexParser(randomBytes(16).toString()).parse()).toThrow();
  });

  files.forEach((file) => {
    it(`should parse index file: ${file}`, () => {
      // Update the index file
      const contents = fs.readFileSync(path.join(dir, file));
      fs.writeFileSync(
        path.join(gitRoot, RELATIVE_PATH_TO_INDEX_FILE),
        contents
      );

      expect(() => new IndexParser(gitRoot).parse()).not.toThrow();
    });
  });
});
