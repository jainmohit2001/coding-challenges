import fs from 'fs';
import { JsonParser } from '../../src/2/json-parser';

describe('Step 1 tests', () => {
  const dir = './tests/2/step1/';
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

      test(`Testing ${dir}${file}`, (done) => {
        const parser = new JsonParser(input);
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
