import { lcs } from '../../src/13/diff';

describe('Testing LCS Function', () => {
  const data = [
    ['ABCDEFG', 'ABCDEFG', 'ABCDEFG'],
    ['ABCDEFG', '', ''],
    ['ABC', 'XYZ', ''],
    ['AABCXY', 'XYZ', 'XY'],
    ['', '', ''],
    ['ABCD', 'AC', 'AC']
  ];

  data.forEach((value) => {
    const s1 = value[0];
    const s2 = value[1];
    const expectedOutput = value[2];

    test(`Testing s1:${s1}, s2:${s2}`, () => {
      const output = lcs(s1, s2);
      expect(output).toBe(expectedOutput);
    });
  });
});
