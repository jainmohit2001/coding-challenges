import { RedisDeserializer } from '../redis_deserializer';

describe('Testing valid inputs', () => {
  const validInputs = [
    '*1\r\n$4\r\nping\r\n',
    '*-1\r\n',
    '*2\r\n$3\r\nget\r\n$3\r\nkey\r\n',
    '+OK\r\n',
    '-Error message\r\n',
    '$0\r\n\r\n',
    '+hello world\r\n',
    '*2\r\n$5\r\nhello\r\n$5\r\nworld\r\n',
    '*3\r\n:1\r\n:2\r\n:3\r\n',
    '*5\r\n:1\r\n:2\r\n:3\r\n:4\r\n$5\r\nhello\r\n',
    '*2\r\n*3\r\n:1\r\n:2\r\n:3\r\n*2\r\n+Hello\r\n-World\r\n',
    '*3\r\n$5\r\nhello\r\n$-1\r\n$5\r\nworld\r\n',
    '*0\r\n'
  ];

  const expectedOutputs = [
    ['ping'],
    null,
    ['get', 'key'],
    'OK',
    new Error('Error message'),
    '',
    'hello world',
    ['hello', 'world'],
    [1, 2, 3],
    [1, 2, 3, 4, 'hello'],
    [
      [1, 2, 3],
      ['Hello', new Error('World')]
    ],
    ['hello', null, 'world'],
    []
  ];

  validInputs.forEach((input, index) => {
    test(`Testing ${JSON.stringify(input)}`, () => {
      const deserializer = new RedisDeserializer(input);
      expect(deserializer.parse()).toStrictEqual(expectedOutputs[index]);
    });
  });
});

describe('Testing invalid inputs', () => {
  const invalidInputs = ['', '*2', '*2\r\n+qwerty\r\n', '+Hello World\r\n*'];

  invalidInputs.forEach((input) => {
    test(`Testing ${JSON.stringify(input)}`, () => {
      const deserializer = new RedisDeserializer(input);
      expect(() => deserializer.parse()).toThrow(Error);
    });
  });
});
