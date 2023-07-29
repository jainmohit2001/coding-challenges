import { RedisSerializer } from '../../src/8/redis_serializer';

const serializer = new RedisSerializer();

test('Testing null', () => {
  const input = null;
  expect(serializer.serialize(input)).toBe('$-1\r\n');
});

test('Testing integer', () => {
  const input = 1;
  expect(serializer.serialize(input)).toBe(`:${input}\r\n`);
});

test('Testing invalid integer', () => {
  const input = 1.1;
  expect(() => serializer.serialize(input)).toThrow(Error);
});

describe('Testing bulk string', () => {
  const inputs = ['Hello World!', 'Hello World\r\n', ''];
  inputs.forEach((input) => {
    test(`Testing bulk string: ${input}`, () => {
      expect(serializer.serializeBulkStrings(input)).toBe(
        `$${input.length}\r\n${input}\r\n`
      );
    });
  });
});

test('Testing simple invalid string', () => {
  const input = 'Hello \r\n';
  expect(() => serializer.serialize(input)).toThrow(Error);
});

test('Testing simple string', () => {
  const input = 'Hello World!';
  expect(serializer.serialize(input)).toBe(`+${input}\r\n`);
});

test('Testing Error', () => {
  const err = new Error('This is an Error!');
  expect(serializer.serialize(err)).toBe(`-${err.message}\r\n`);
});

describe('Testing arrays', () => {
  const arrays = [
    [1],
    [],
    ['Simple string'],
    [1, null],
    [1, null, 3],
    [new Error('Error')],
    [1, null, 3, [2, null, new Error('Error')]]
  ];

  const expectedOutputs = [
    '*1\r\n:1\r\n',
    '*0\r\n',
    '*1\r\n+Simple string\r\n',
    '*2\r\n:1\r\n$-1\r\n',
    '*3\r\n:1\r\n$-1\r\n:3\r\n',
    '*1\r\n-Error\r\n',
    '*4\r\n:1\r\n$-1\r\n:3\r\n*3\r\n:2\r\n$-1\r\n-Error\r\n'
  ];

  arrays.forEach((input, index: number) => {
    test(`Testing ${input.toString()}`, () => {
      expect(serializer.serialize(input)).toBe(expectedOutputs[index]);
    });
  });
});

describe('Testing invalid arrays', () => {
  const arrays = [[{}], {}, [1, [2, {}]]];

  arrays.forEach((input) => {
    test(`Testing ${input.toString()}`, () => {
      expect(() => serializer.serialize(input)).toThrow(Error);
    });
  });
});
