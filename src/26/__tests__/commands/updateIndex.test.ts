import fs from 'fs';
import { randomBytes } from 'crypto';
import updateIndex from '../../commands/updateIndex';
import { createTempGitRepo } from '../../jestHelpers';
import IndexParser from '../../indexParser';

describe('Testing update-index command', () => {
  createTempGitRepo();

  it('should throw error on invalid args', () => {
    expect(() => updateIndex({ files: undefined })).toThrow();
    expect(() => updateIndex({ files: [] })).toThrow();
    expect(() => updateIndex({ files: [randomBytes(2).toString()] })).toThrow();
  });

  it('should add file to index successfully', () => {
    const filename = 'cc.txt';
    fs.closeSync(fs.openSync(filename, 'w'));
    const expectedStat = fs.statSync(filename);

    updateIndex({ files: [filename] });

    const index = new IndexParser().parse();

    expect(index.entries.length).toBe(1);

    const entry = index.entries[0];
    expect(entry.name).toBe(filename);
    expect(entry.ino).toBe(expectedStat.ino);
    expect(entry.dev).toBe(expectedStat.dev);
    expect(entry.size).toBe(expectedStat.size);
    expect(entry.gid).toBe(expectedStat.gid);
    expect(entry.uid).toBe(expectedStat.uid);
  });
});
