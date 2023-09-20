import { Kind, Msg, Parser, State } from '../parser';
import { SubArg, parseSub } from '../utils';

it('should throw error on invalid start character of message', () => {
  const buf = Buffer.from('1');
  const parser = new Parser(() => {});
  expect(() => parser.parse(buf)).toThrow();
});

describe('Testing "CONNECT"', () => {
  const bufList = [
    Buffer.from('CONNECT {}\r\n'),

    // Should handle Whitespace
    Buffer.from('CONNECT\t{}\r\n'),

    // Should handle small case letters
    Buffer.from('cONNECT {}\r\n'),
    Buffer.from('CoNNECT {}\r\n'),
    Buffer.from('COnNECT {}\r\n'),
    Buffer.from('CONnECT {}\r\n'),
    Buffer.from('CONNeCT {}\r\n'),
    Buffer.from('CONNEcT {}\r\n'),
    Buffer.from('CONNECt {}\r\n')
  ];
  bufList.forEach((buf) => {
    it(`should parse ${JSON.stringify(buf.toString())}`, (done) => {
      const cb = (msg: Msg) => {
        expect(msg.kind).toBe(Kind.CONNECT);
        expect(msg.data!.toString()).toBe('{}');
        done();
      };

      const parser = new Parser(cb);
      parser.parse(buf);

      expect(parser.state).toBe(State.OP_START);
    });
  });

  it('should parse "CONNECT" command with split args', (done) => {
    const cb = (msg: Msg) => {
      expect(msg.kind).toBe(Kind.CONNECT);
      expect(msg.data!.toString()).toBe('{}');
      done();
    };

    const parser = new Parser(cb);
    const bufList = [Buffer.from('CONNECT {'), Buffer.from('}\r\n')];

    parser.parse(bufList[0]);
    expect(parser.state).toBe(State.CONNECT_ARG);
    parser.parse(bufList[1]);
    expect(parser.state).toBe(State.OP_START);
  });
});

describe('Testing invalid "COMMAND"', () => {
  const bufList = [
    Buffer.from('CqNNECT'),
    Buffer.from('COqNECT'),
    Buffer.from('CONqECT'),
    Buffer.from('CONNqCT'),
    Buffer.from('CONNEqT'),
    Buffer.from('CONNECq')
  ];

  bufList.forEach((buf) => {
    it(`should throw error when parsing "${buf.toString()}"`, () => {
      const parser = new Parser(() => {});
      expect(() => parser.parse(buf)).toThrow();
    });
  });
});

describe('Testing "PING" and "PONG"', () => {
  const pingBufList = [
    Buffer.from('PING\r\n'),

    // Should handle small case letters
    Buffer.from('pING\r\n'),
    Buffer.from('PiNG\r\n'),
    Buffer.from('PInG\r\n'),
    Buffer.from('PINg\r\n'),

    // Should handle spaces
    Buffer.from('PING \r\n'),
    Buffer.from('PING\r \n'),
    Buffer.from('PING \r \n')
  ];

  pingBufList.forEach((buf) => {
    it(`should parse ${JSON.stringify(buf.toString())}`, (done) => {
      const cb = (msg: Msg) => {
        expect(msg.kind).toBe(Kind.PING);
        done();
      };

      const parser = new Parser(cb);
      parser.parse(buf);
      expect(parser.state).toBe(State.OP_START);
    });
  });

  const pongBufList = [
    Buffer.from('PONG\r\n'),

    // Should handle small case letters
    Buffer.from('pONG\r\n'),
    Buffer.from('PoNG\r\n'),
    Buffer.from('POnG\r\n'),
    Buffer.from('POng\r\n'),

    // Should handle spaces
    Buffer.from('PONG \r\n'),
    Buffer.from('PONG\r \n'),
    Buffer.from('PONG \r \n')
  ];

  pongBufList.forEach((buf) => {
    it(`should parse ${JSON.stringify(buf.toString())}`, (done) => {
      const cb = (msg: Msg) => {
        expect(msg.kind).toBe(Kind.PONG);
        done();
      };

      const parser = new Parser(cb);
      parser.parse(buf);
      expect(parser.state).toBe(State.OP_START);
    });
  });
});

describe('Testing invalid "PING" and "PONG"', () => {
  const bufList = [
    Buffer.from('PqNG'),
    Buffer.from('PIqG'),
    Buffer.from('PINq'),
    Buffer.from('POqG'),
    Buffer.from('PONq')
  ];

  bufList.forEach((buf) => {
    it(`should throw error when parsing "${buf.toString()}"`, () => {
      const parser = new Parser(() => {});
      expect(() => parser.parse(buf)).toThrow();
    });
  });
});

describe('Testing "SUB" command', () => {
  const tests = [
    {
      input: Buffer.from('SUB FOO 1\r\n'),
      output: { subject: Buffer.from('FOO'), sid: Buffer.from('1') } as SubArg
    },
    {
      input: Buffer.from('SUB FOO G1 44\r\n'),
      output: {
        subject: Buffer.from('FOO'),
        group: Buffer.from('G1'),
        sid: Buffer.from('44')
      } as SubArg
    },

    // Should handle whitespace
    {
      input: Buffer.from('SUB\tFOO 1\r\n'),
      output: { subject: Buffer.from('FOO'), sid: Buffer.from('1') } as SubArg
    },

    // Should handle small case letters
    {
      input: Buffer.from('sUB FOO 1\r\n'),
      output: { subject: Buffer.from('FOO'), sid: Buffer.from('1') } as SubArg
    },
    {
      input: Buffer.from('SuB FOO 1\r\n'),
      output: { subject: Buffer.from('FOO'), sid: Buffer.from('1') } as SubArg
    },
    {
      input: Buffer.from('SUb FOO 1\r\n'),
      output: { subject: Buffer.from('FOO'), sid: Buffer.from('1') } as SubArg
    }
  ];
  tests.forEach(({ input, output }) => {
    it(`should parse ${JSON.stringify(input.toString())}`, (done) => {
      const cb = (msg: Msg) => {
        expect(msg.kind).toBe(Kind.SUB);
        const parsedSub = parseSub(msg.data!);
        expect(parsedSub).toMatchObject(output);
        done();
      };

      const parser = new Parser(cb);
      parser.parse(input);

      expect(parser.state).toBe(State.OP_START);
    });
  });

  it('should parse "SUB" command with split args', (done) => {
    const bufList = [
      Buffer.from('SUB FOO '),
      Buffer.from('G1 '),
      Buffer.from('44\r\n')
    ];

    const output = {
      subject: Buffer.from('FOO'),
      group: Buffer.from('G1'),
      sid: Buffer.from('44')
    } as SubArg;

    const cb = (msg: Msg) => {
      expect(msg.kind).toBe(Kind.SUB);
      const parsedSub = parseSub(msg.data!);
      expect(parsedSub).toMatchObject(output);
      done();
    };

    const parser = new Parser(cb);

    expect(parser.state).toBe(State.OP_START);
    parser.parse(bufList[0]);
    expect(parser.state).toBe(State.SUB_ARG);
    parser.parse(bufList[1]);
    expect(parser.state).toBe(State.SUB_ARG);
    parser.parse(bufList[2]);
    expect(parser.state).toBe(State.OP_START);
  });
});

describe('Testing invalid "SUB"', () => {
  const bufList = [Buffer.from('qUB'), Buffer.from('SqB'), Buffer.from('SUq')];

  bufList.forEach((buf) => {
    it(`should throw error when parsing "${buf.toString()}"`, () => {
      const parser = new Parser(() => {});
      expect(() => parser.parse(buf)).toThrow();
    });
  });
});
