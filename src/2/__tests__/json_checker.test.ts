import fs from 'fs';
import { JsonParser } from '../json-parser';
import path from 'path';

describe('Tests provided by JSON ORG', () => {
  const dir = path.join(__dirname, 'json_checker/');
  const files = fs.readdirSync(dir);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  files.forEach((file: string) => {
    if (file.endsWith('.json')) {
      const input = fs.readFileSync(`${dir}${file}`, 'utf8').toString();
      let exitCode = 0;
      try {
        JSON.parse(input);
      } catch (err) {
        exitCode = 1;
      }
      const parser = new JsonParser(input);

      test(`Testing ${dir}${file}`, (done) => {
        const mockExit = jest
          .spyOn(process, 'exit')
          .mockImplementation((number) => {
            throw new Error('process.exit: ' + number);
          });

        expect(() => {
          parser.parse();
        }).toThrow();

        expect(mockExit).toHaveBeenCalledWith(exitCode);

        mockExit.mockRestore();
        done();
      });
    }
  });
});
