interface JoinCommand {
  channel: string;
  key?: string;
}

interface PartCommandProps {
  channels: string[];
  partMessage?: string;
}

interface IRCClientInterface {
  host: string;
  port: number;
  nickName: string;
  realName: string;
  connected: boolean;
  connect(): Promise<unknown>;
  disconnect(): Promise<void>;
  join(channels: JoinCommand[]): Promise<unknown>;
  part(props: PartCommandProps): Promise<unknown>;
  getChannelDetails(channel: string): IChannelDetails | undefined;
}

interface IChannelDetails {
  channel: string;
  topic: string | null;
  names: Set<string>;
  setTopic(topic: string | null): void;
  setNames(names: Set<string>): void;
  addName(name: string): void;
  removeName(name: string): void;
}

class ChannelDetails implements IChannelDetails {
  channel;
  topic;
  names;

  constructor(
    channel: string,
    topic: string | null = null,
    names?: Set<string>
  ) {
    this.channel = channel;
    this.topic = topic;
    this.names = names ?? new Set<string>();
  }

  setTopic(topic: string | null) {
    this.topic = topic;
  }

  setNames(names: Set<string>) {
    this.names = names;
  }

  addName(name: string) {
    this.names.add(name);
  }
  removeName(name: string): void {
    this.names.delete(name);
  }
}

type SupportedCommands = 'USER' | 'JOIN' | 'PART' | 'NICK';

class CommandWaitingForReply {
  resolve;
  reject;
  command: SupportedCommands;

  constructor(
    resolve: (value: unknown) => void,
    reject: (value: unknown) => void,
    command: SupportedCommands
  ) {
    this.resolve = resolve;
    this.reject = reject;
    this.command = command;
  }
}

export {
  JoinCommand,
  PartCommandProps,
  IRCClientInterface,
  IChannelDetails,
  ChannelDetails,
  CommandWaitingForReply,
  SupportedCommands
};
