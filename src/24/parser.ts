import { PubArg, preparePub } from './utils';

const LEN_CRLF = 2;

export interface Msg {
  kind: Kind;
  data?: Buffer;
  pubArg?: PubArg;
}

export class Parser {
  state: State;
  private argStart: number;
  private drop: number;
  private argBuf?: Buffer;
  private pubArg?: PubArg;
  private msgBuf?: Buffer;

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
            case cc.U:
            case cc.u:
              this.state = State.OP_U;
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
            case cc.U:
            case cc.u:
              this.state = State.OP_PU;
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
          break;
        case State.OP_PU:
          switch (b) {
            case cc.B:
            case cc.b:
              this.state = State.OP_PUB;
              break;
            default:
              throw this.fail(buf.subarray(i));
          }
          break;
        case State.OP_PUB:
          switch (b) {
            case cc.SPACE:
            case cc.TAB:
              continue;
            default:
              this.state = State.PUB_ARG;
              this.argStart = i;
          }
          break;
        case State.PUB_ARG:
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
              } else {
                arg = buf.subarray(this.argStart, i - this.drop);
              }

              this.pubArg = preparePub(arg);
              this.argStart = i + 1;
              this.drop = 0;
              this.state = State.MSG_PAYLOAD;

              // If no msgBuf is present, then skip ahead the bytes.
              // It this jump falls out from the loop,
              // then we will handle split buffer case.
              if (this.msgBuf === undefined) {
                i = this.argStart + this.pubArg.payloadSize - LEN_CRLF;
              }
            }
          }
          break;
        case State.MSG_PAYLOAD:
          // msgBuf is present. It means we are still parsing Payload.
          // Hence all bytes from index 0 to index i will be part of payload.
          if (this.msgBuf !== undefined) {
            // Check if we have parsed the required number of bytes.
            // Total bytes parsed =
            //    total bytes present in msgBuf +
            //    total bytes parsed in this new buffer (which is i + 1)
            if (i + this.msgBuf.length + 1 >= this.pubArg!.payloadSize) {
              this.state = State.MSG_END_CR;
            } else {
              // Otherwise keep on parsing Payload
              // This can result in exhausting the for loop,
              // then we will handle the split buffer case.
              continue;
            }
          }
          // If we have read the number of bytes specified,
          // then change the state to MSG_END_CR.
          // This is only valid when the payload ends in the same message.
          else if (i - this.argStart + 1 >= this.pubArg!.payloadSize) {
            this.state = State.MSG_END_CR;
          }
          break;
        case State.MSG_END_CR:
          // We are expecting a CR
          if (b !== cc.CR) {
            throw this.fail(buf.subarray(i));
          }

          this.drop = 1;
          this.state = State.MSG_END_LF;
          break;
        case State.MSG_END_LF:
          // We are expecting a LF
          if (b !== cc.LF) {
            throw this.fail(buf.subarray(i));
          }

          // If the payload is not split in two buffers
          if (this.msgBuf === undefined) {
            this.pubArg!.payload = buf.subarray(this.argStart, i - this.drop);
          }
          // Otherwise concat the buffers
          else {
            this.pubArg!.payload = Buffer.concat([
              this.msgBuf,
              buf.subarray(this.argStart, i - this.drop)
            ]);
          }

          this.cb({ kind: Kind.PUB, pubArg: this.pubArg });

          // Clear argBuf and msgBuf
          this.argBuf = undefined;
          this.msgBuf = undefined;
          this.argStart = i + 1;
          this.drop = 0;
          this.state = State.OP_START;
          break;
        case State.OP_U:
          switch (b) {
            case cc.N:
            case cc.n:
              this.state = State.OP_UN;
              break;
            default:
              throw this.fail(buf.subarray(i));
          }
          break;
        case State.OP_UN:
          switch (b) {
            case cc.S:
            case cc.s:
              this.state = State.OP_UNS;
              break;
            default:
              throw this.fail(buf.subarray(i));
          }
          break;
        case State.OP_UNS:
          switch (b) {
            case cc.U:
            case cc.u:
              this.state = State.OP_UNSU;
              break;
            default:
              throw this.fail(buf.subarray(i));
          }
          break;
        case State.OP_UNSU:
          switch (b) {
            case cc.B:
            case cc.b:
              this.state = State.OP_UNSUB;
              break;
            default:
              throw this.fail(buf.subarray(i));
          }
          break;
        case State.OP_UNSUB:
          switch (b) {
            case cc.SPACE:
            case cc.TAB:
              continue;
            default:
              this.state = State.UNSUB_ARG;
              this.argStart = i;
          }
          break;
        case State.UNSUB_ARG:
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

              this.cb({ kind: Kind.UNSUB, data: arg });
              this.argStart = i + 1;
              this.drop = 0;
              this.state = State.OP_START;
              break;
            }
            default:
              continue;
          }
          break;
      }
    }

    // If the message is broken between two buffers for ARG state
    if (
      this.state === State.CONNECT_ARG ||
      this.state === State.SUB_ARG ||
      this.state === State.PUB_ARG ||
      this.state === State.UNSUB_ARG
    ) {
      // If argBuf is undefined than initialize it.
      if (this.argBuf === undefined) {
        // We need to allocate a new Buffer otherwise
        // if the original buffer changes, argBuf will change as well.
        this.argBuf = Buffer.from(buf.subarray(this.argStart, i - this.drop));
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

    // Still parsing Payload
    if (
      this.state === State.MSG_PAYLOAD ||
      this.state === State.MSG_END_CR ||
      this.state === State.MSG_END_LF
    ) {
      if (this.msgBuf === undefined) {
        this.msgBuf = Buffer.from(buf.subarray(this.argStart, i - this.drop));
      } else {
        this.msgBuf = Buffer.concat([
          this.msgBuf,
          buf.subarray(this.argStart, i - this.drop)
        ]);
      }

      // The pubArg contains information that points to original buf memory.
      // If the original buffer changes then pubArg will also change.
      // Hence pubArg needs to be cloned.
      if (this.argBuf === undefined) {
        this.clonePubArg();
      }
    }
  }

  private clonePubArg() {
    const subjectLength = this.pubArg!.subject.length;
    const replyLength = this.pubArg?.replyTo?.length ?? 0;

    // Allocate new memory
    const newBuf = Buffer.alloc(subjectLength + replyLength);

    // Update the memory
    newBuf.set(this.pubArg!.subject);
    if (this.pubArg!.replyTo) {
      newBuf.set(this.pubArg!.replyTo, subjectLength);
    }

    // We need to keep a reference to newBuf otherwise
    // it will be called for Garbage collection.
    this.argBuf = newBuf;

    // Update the pubArg
    this.pubArg!.subject = newBuf.subarray(0, subjectLength);
    if (this.pubArg!.replyTo) {
      this.pubArg!.replyTo = newBuf.subarray(subjectLength);
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
  PUB,
  UNSUB
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
  OP_PUB,
  PUB_ARG,
  MSG_PAYLOAD,
  MSG_END_CR,
  MSG_END_LF,
  OP_U,
  OP_UN,
  OP_UNS,
  OP_UNSU,
  OP_UNSUB,
  UNSUB_ARG
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
