import stream from 'stream';

type GitObjectType = 'blob' | 'commit' | 'tree' | 'tag';

interface BaseCommandArgs {
  stdin?: stream.Readable;
  stdout?: stream.Writable;
  stderr?: stream.Writable;
}
export { GitObjectType, BaseCommandArgs };
