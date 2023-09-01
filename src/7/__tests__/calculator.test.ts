import { Calculator } from '../calculator';

describe('Testing Calculator ', () => {
  const validFormats = new Map<string, number>();

  validFormats.set('1 + 2', 3);
  validFormats.set('(1 + 1) * 5', 10);
  validFormats.set('(1.02 + 1) * 5.11', 10.3222);
  validFormats.set('3 + 4 * 2 / ( 1 - 5 ) ^ 2 ^ 3', 3.002);

  validFormats.forEach((value, key) => {
    test(`Testing valid format ${key}`, () => {
      const answer = new Calculator(key).calculate();
      expect(answer.toPrecision(3)).toBe(value.toPrecision(3));
    });
  });
});
