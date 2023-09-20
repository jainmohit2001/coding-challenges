import { Kind, Msg, Parser, State } from '../parser';

describe('Testing "CONNECT"', () => {
  const bufList = [
    Buffer.from('CONNECT {}\r\n'),
    Buffer.from('cONNECT {}\r\n'),
    Buffer.from('CoNNECT {}\r\n'),
    Buffer.from('COnNECT {}\r\n'),
    Buffer.from('CONnECT {}\r\n'),
    Buffer.from('CONNeCT {}\r\n'),
    Buffer.from('CONNEcT {}\r\n'),
    Buffer.from('CONNECt {}\r\n')
  ];
  bufList.forEach((buf) => {
    it(`should parse ${JSON.stringify(buf.toString())} command`, (done) => {
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
    const bufList = [Buffer.from('CONNECT '), Buffer.from('{}\r\n')];

    bufList.forEach((buf) => {
      parser.parse(buf);
    });
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
    Buffer.from('pING\r\n'),
    Buffer.from('PiNG\r\n'),
    Buffer.from('PInG\r\n'),
    Buffer.from('PINg\r\n')
  ];

  pingBufList.forEach((buf) => {
    it(`should parse ${JSON.stringify(buf.toString())} command`, (done) => {
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
    Buffer.from('pONG\r\n'),
    Buffer.from('PoNG\r\n'),
    Buffer.from('POnG\r\n'),
    Buffer.from('POng\r\n')
  ];

  pongBufList.forEach((buf) => {
    it(`should parse ${JSON.stringify(buf.toString())} command`, (done) => {
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
