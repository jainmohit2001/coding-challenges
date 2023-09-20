import { Kind, Msg, Parser } from '../parser';

describe('Testing CONNECT', () => {
  it('should parse CONNECT command', (done) => {
    const cb = (msg: Msg) => {
      expect(msg.kind).toBe(Kind.CONNECT);
      expect(msg.data.toString()).toBe('{}');
      done();
    };
    const parser = new Parser(cb);
    const buf = Buffer.from('CONNECT {}\r\n');
    parser.parse(buf);
  });

  it('should parse CONNECT command with split args', (done) => {
    const cb = (msg: Msg) => {
      expect(msg.kind).toBe(Kind.CONNECT);
      expect(msg.data.toString()).toBe('{}');
      done();
    };
    const parser = new Parser(cb);
    const bufList = [Buffer.from('CONNECT '), Buffer.from('{}\r\n')];
    bufList.forEach((buf) => {
      parser.parse(buf);
    });
  });
});
