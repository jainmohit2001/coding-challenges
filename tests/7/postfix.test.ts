import { Postfix } from '../../src/7/postfix';

describe('Testing Postfix parse function', () => {
  const validFormats = new Map<string, string>();
  const invalidFormats = [
    '1 + 2 *',
    ')(',
    '1 * * 2',
    '1 + + 2',
    '1 & 2',
    '( 2 * ( 3 + ) + 4',
    '( 2 * 4 ) + )'
  ];

  validFormats.set('1 + 2', '1 2 +');
  validFormats.set('(1 + 1) * 5', '1 1 + 5 *');
  validFormats.set('(1.02 + 1) * 5.11', '1.02 1 + 5.11 *');
  validFormats.set(
    '3 + 4 * 2 / ( 1 - 5 ) ^ 2 ^ 3',
    '3 4 2 * 1 5 - 2 3 ^ ^ / +'
  );

  validFormats.forEach((value, key) => {
    test(`Testing valid format ${key}`, () => {
      const queue = new Postfix(key).parse();

      let postfixString = '';

      while (queue.size() > 0) {
        const token = queue.dequeue();

        if (token === '(') {
          postfixString += token;
        } else {
          postfixString += token + ' ';
        }
      }

      expect(postfixString.trim()).toBe(value);
    });
  });

  invalidFormats.forEach((str) => {
    test(`Testing invalid format ${str}`, () => {
      expect(() => new Postfix(str).parse()).toThrow();
    });
  });
});
