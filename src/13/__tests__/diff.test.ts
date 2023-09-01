import { lcs, lcsArray } from '../diff';

describe('Testing lcs Function', () => {
  // [s1, s2]
  const inputs: string[][] = [
    ['ABCDEFG', 'ABCDEFG'],
    ['ABCDEFG', ''],
    ['ABC', 'XYZ'],
    ['AABCXY', 'XYZ'],
    ['', ''],
    ['ABCD', 'AC']
  ];

  // [lcs, inserted, deleted]
  const outputs: string[][] = [
    ['ABCDEFG', '', ''],
    ['', '', 'ABCDEFG'],
    ['', 'XYZ', 'ABC'],
    ['XY', 'Z', 'AABC'],
    ['', '', ''],
    ['AC', '', 'BD']
  ];

  inputs.forEach((input, index) => {
    const s1 = input[0];
    const s2 = input[1];
    const expectedOutput = outputs[index];

    test(`Testing s1:${s1}, s2:${s2}`, () => {
      const output = lcs(s1, s2);
      expect(output).toStrictEqual(expectedOutput);
    });
  });
});

describe('Testing lcsArray function', () => {
  const inputs = [
    [
      ['This is a test which contains:', 'this is the lcs'],
      ['this is the lcs', "we're testing"]
    ],
    [
      [
        'Coding Challenges helps you become a better software engineer through that build real applications.',
        'I share a weekly coding challenge aimed at helping software engineers level up their skills through deliberate practice.',
        "I've used or am using these coding challenges as exercise to learn a new programming language or technology.",
        'Each challenge will have you writing a full application or tool. Most of which will be based on real world tools and utilities.'
      ],
      [
        'Helping you become a better software engineer through coding challenges that build real applications.',
        'I share a weekly coding challenge aimed at helping software engineers level up their skills through deliberate practice.',
        "These are challenges that I've used or am using as exercises to learn a new programming language or technology.",
        'Each challenge will have you writing a full application or tool. Most of which will be based on real world tools and utilities.'
      ]
    ]
  ];

  const outputs = [
    [
      ['this is the lcs'],
      ['- This is a test which contains:', "+ we're testing"]
    ],
    [
      [
        'I share a weekly coding challenge aimed at helping software engineers level up their skills through deliberate practice.',
        'Each challenge will have you writing a full application or tool. Most of which will be based on real world tools and utilities.'
      ],
      [
        '- Coding Challenges helps you become a better software engineer through that build real applications.',
        '+ Helping you become a better software engineer through coding challenges that build real applications.',
        "- I've used or am using these coding challenges as exercise to learn a new programming language or technology.",
        "+ These are challenges that I've used or am using as exercises to learn a new programming language or technology."
      ]
    ]
  ];

  inputs.forEach((input, index) => {
    const arr1 = input[0];
    const arr2 = input[1];
    const expectedOutput = outputs[index];

    test(`Testing index:${index}`, () => {
      const output = lcsArray(arr1, arr2);
      expect(output).toStrictEqual(expectedOutput);
    });
  });
});
