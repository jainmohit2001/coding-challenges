import fs from 'fs';
import { randomBytes } from 'crypto';
import updateIndex from '../../commands/updateIndex';
import { createTempGitRepo } from '../../jestHelpers';
import IndexParser from '../../indexParser';
import { RELATIVE_PATH_TO_INDEX_FILE } from '../../constants';
import path from 'path';

describe('Testing update-index command', () => {
  const gitRoot = createTempGitRepo();

  it('should throw error on invalid args', () => {
    expect(() => updateIndex({ gitRoot, files: undefined })).toThrow();
    expect(() => updateIndex({ gitRoot, files: [] })).toThrow();
    expect(() =>
      updateIndex({ gitRoot, files: [randomBytes(2).toString()] })
    ).toThrow();
  });

  it('should add file to index and create a new index file', () => {
    expect(
      fs.existsSync(path.join(gitRoot, RELATIVE_PATH_TO_INDEX_FILE))
    ).toBeFalsy();

    const filename = 'cc.txt';
    fs.closeSync(fs.openSync(filename, 'w'));
    const expectedStat = fs.statSync(filename);

    updateIndex({ gitRoot, files: [filename] });

    expect(
      fs.existsSync(path.join(gitRoot, RELATIVE_PATH_TO_INDEX_FILE))
    ).toBeTruthy();

    const index = new IndexParser(gitRoot).parse();

    expect(index.entries.length).toBe(1);

    const entry = index.getEntry(filename);

    expect(entry).not.toBe(undefined);
    if (entry) {
      expect(entry.name).toBe(filename);
      expect(entry.ino).toBe(expectedStat.ino);
      expect(entry.dev).toBe(expectedStat.dev);
      expect(entry.size).toBe(expectedStat.size);
      expect(entry.gid).toBe(expectedStat.gid);
      expect(entry.uid).toBe(expectedStat.uid);
    }
  });

  it('should add multiple files to index successfully', () => {
    const files: { name: string; content: Buffer }[] = [
      { name: 'dir1/text1.txt', content: randomBytes(32) },
      { name: 'dir2/subdir2/text2.txt', content: randomBytes(64) }
    ];

    files.forEach(({ name, content }) => {
      fs.mkdirSync(path.dirname(name), { recursive: true });
      fs.writeFileSync(name, content);
    });
    const fileNames: string[] = files.map(({ name }) => {
      return name;
    });

    updateIndex({ gitRoot, files: fileNames });

    const index = new IndexParser(gitRoot).parse();

    files.forEach(({ name, content }) => {
      const entry1 = index.getEntry(name);

      expect(entry1).not.toBe(undefined);
      if (entry1) {
        expect(entry1.name).toBe(name);
        expect(entry1.size).toBe(content.byteLength);
      }
    });
  });
});
