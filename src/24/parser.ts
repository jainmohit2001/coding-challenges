export interface Msg {
  kind: Kind;
  data?: Buffer;
}

export class Parser {
  state: State;
  private argStart: number;
  private drop: number;
  private argBuf?: Buffer;

  cb: (msg: Msg) => void;

  constructor(cb: (msg: Msg) => void) {
    this.state = State.OP_START;
    this.cb = cb;
    this.argStart = 0;
    this.drop = 0;
  }

  parse(buf: Buffer) {
    // For every buffer, we need to reset these pointers
    this.argStart = 0;
    this.drop = 0;

    let i: number;
    for (i = 0; i < buf.length; i++) {
      const b = buf[i];
      switch (this.state) {
        case State.OP_START:
          switch (b) {
            case cc.C:
            case cc.c:
              this.state = State.OP_C;
              break;
            case cc.P:
            case cc.p:
              this.state = State.OP_P;
              break;
            case cc.S:
            case cc.s:
              this.state = State.OP_S;
              break;
            default:
              throw this.fail(buf.subarray(i));
          }
          break;
        case State.OP_C:
          switch (b) {
            case cc.O:
            case cc.o:
              this.state = State.OP_CO;
              break;
            default:
              throw this.fail(buf.subarray(i));
          }
          break;
        case State.OP_CO:
          switch (b) {
            case cc.N:
            case cc.n:
              this.state = State.OP_CON;
              break;
            default:
              throw this.fail(buf.subarray(i));
          }
          break;
        case State.OP_CON:
          switch (b) {
            case cc.N:
            case cc.n:
              this.state = State.OP_CONN;
              break;
            default:
              throw this.fail(buf.subarray(i));
          }
          break;
        case State.OP_CONN:
          switch (b) {
            case cc.E:
            case cc.e:
              this.state = State.OP_CONNE;
              break;
            default:
              throw this.fail(buf.subarray(i));
          }
          break;
        case State.OP_CONNE:
          switch (b) {
            case cc.C:
            case cc.c:
              this.state = State.OP_CONNEC;
              break;
            default:
              throw this.fail(buf.subarray(i));
          }
          break;
        case State.OP_CONNEC:
          switch (b) {
            case cc.T:
            case cc.t:
              this.state = State.OP_CONNECT;
              break;
            default:
              throw this.fail(buf.subarray(i));
          }
          break;
        case State.OP_CONNECT:
          switch (b) {
            case cc.TAB:
            case cc.SPACE:
              continue;
            default:
              this.state = State.CONNECT_ARG;
              this.argStart = i;
          }
          break;
        case State.CONNECT_ARG:
          switch (b) {
            case cc.CR:
              this.drop = 1;
              break;
            case cc.LF: {
              // arg signifies the CONNECT arguments
              let arg: Buffer;

              // If their was a previous buffer, then concat the data.
              // We also need to set the previous buffer variable to undefined,
              // which will trigger garbage collection.
              if (this.argBuf) {
                arg = Buffer.concat([
                  this.argBuf,
                  buf.subarray(this.argStart, i - this.drop)
                ]);
                this.argBuf = undefined;
              } else {
                arg = buf.subarray(this.argStart, i - this.drop);
              }
              this.cb({ kind: Kind.CONNECT, data: arg });
              this.argStart = i + 1;
              this.drop = 0;
              this.state = State.OP_START;
              break;
            }
            default:
              continue;
          }
          break;
        case State.OP_P:
          switch (b) {
            case cc.I:
            case cc.i:
              this.state = State.OP_PI;
              break;
            case cc.O:
            case cc.o:
              this.state = State.OP_PO;
              break;
            default:
              throw this.fail(buf.subarray(i));
          }
          break;
        case State.OP_PI:
          switch (b) {
            case cc.N:
            case cc.n:
              this.state = State.OP_PIN;
              break;
            default:
              throw this.fail(buf.subarray(i));
          }
          break;
        case State.OP_PIN:
          switch (b) {
            case cc.G:
            case cc.g:
              this.state = State.OP_PING;
              break;
            default:
              throw this.fail(buf.subarray(i));
          }
          break;
        case State.OP_PING:
          switch (b) {
            case cc.LF: {
              this.cb({ kind: Kind.PING });
              this.drop = 0;
              this.state = State.OP_START;
              break;
            }
          }
          break;
        case State.OP_PO:
          switch (b) {
            case cc.N:
            case cc.n:
              this.state = State.OP_PON;
              break;
            default:
              throw this.fail(buf.subarray(i));
          }
          break;
        case State.OP_PON:
          switch (b) {
            case cc.G:
            case cc.g:
              this.state = State.OP_PONG;
              break;
            default:
              throw this.fail(buf.subarray(i));
          }
          break;
        case State.OP_PONG:
          switch (b) {
            case cc.LF:
              {
                this.cb({ kind: Kind.PONG });
                this.drop = 0;
                this.state = State.OP_START;
              }
              break;
          }
          break;
        case State.OP_S:
          switch (b) {
            case cc.U:
            case cc.u:
              this.state = State.OP_SU;
              break;
            default:
              throw this.fail(buf.subarray(i));
          }
          break;
        case State.OP_SU:
          switch (b) {
            case cc.B:
            case cc.b:
              this.state = State.OP_SUB;
              break;
            default:
              throw this.fail(buf.subarray(i));
          }
          break;
        case State.OP_SUB: {
          switch (b) {
            case cc.TAB:
            case cc.SPACE:
              continue;
            default:
              this.state = State.SUB_ARG;
              this.argStart = i;
          }
          break;
        }
        case State.SUB_ARG:
          switch (b) {
            case cc.CR:
              this.drop = 1;
              break;
            case cc.LF: {
              let arg: Buffer;

              if (this.argBuf) {
                arg = Buffer.concat([
                  this.argBuf,
                  buf.subarray(this.argStart, i - this.drop)
                ]);
                this.argBuf = undefined;
              } else {
                arg = buf.subarray(this.argStart, i - this.drop);
              }

              this.cb({ kind: Kind.SUB, data: arg });
              this.argStart = i + 1;
              this.drop = 0;
              this.state = State.OP_START;
              break;
            }
            default:
              continue;
          }
      }
    }

    // If the message is broken between two buffers for ARG state
    if (this.state === State.CONNECT_ARG || this.state === State.SUB_ARG) {
      // If argBuf is undefined than initialize it.
      if (this.argBuf === undefined) {
        this.argBuf = buf.subarray(this.argStart, i - this.drop);
      }
      // Otherwise concat the prev argBuf and the subarray
      // NOTE: This is not a full zero allocation parsing
      else {
        this.argBuf = Buffer.concat([
          this.argBuf,
          buf.subarray(this.argStart, i - this.drop)
        ]);
      }
    }
  }

  private fail(data: Buffer) {
    return new Error(`parse Error ${this.state}: ${data.toString()}`);
  }
}

export enum Kind {
  CONNECT,
  PING,
  PONG,
  SUB,
  PUB
}

export enum State {
  OP_START = 0,
  OP_C,
  OP_CO,
  OP_CON,
  OP_CONN,
  OP_CONNE,
  OP_CONNEC,
  OP_CONNECT,
  CONNECT_ARG,
  OP_P,
  OP_PI,
  OP_PIN,
  OP_PING,
  OP_PO,
  OP_PON,
  OP_PONG,
  OP_S,
  OP_SU,
  OP_SUB,
  SUB_ARG,
  OP_PU,
  OP_PUB
}

enum cc {
  CR = '\r'.charCodeAt(0),
  LF = '\n'.charCodeAt(0),
  SPACE = ' '.charCodeAt(0),
  TAB = '\t'.charCodeAt(0),
  C = 'C'.charCodeAt(0),
  c = 'c'.charCodeAt(0),
  O = 'O'.charCodeAt(0),
  o = 'o'.charCodeAt(0),
  N = 'N'.charCodeAt(0),
  n = 'n'.charCodeAt(0),
  E = 'E'.charCodeAt(0),
  e = 'e'.charCodeAt(0),
  T = 'T'.charCodeAt(0),
  t = 't'.charCodeAt(0),
  P = 'P'.charCodeAt(0),
  p = 'p'.charCodeAt(0),
  I = 'I'.charCodeAt(0),
  i = 'i'.charCodeAt(0),
  G = 'G'.charCodeAt(0),
  g = 'g'.charCodeAt(0),
  S = 'S'.charCodeAt(0),
  s = 's'.charCodeAt(0),
  U = 'U'.charCodeAt(0),
  u = 'u'.charCodeAt(0),
  B = 'B'.charCodeAt(0),
  b = 'b'.charCodeAt(0)
}
