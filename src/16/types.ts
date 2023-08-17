interface IPrefix {
  serverName?: string;
  nickName?: string;
  user?: string;
  host?: string;
}

interface IRCMessage {
  /**
   * The command sent by the server.
   *
   * @type {string}
   */
  command: string;
  /**
   * This is a list of string used by server to pass various parameters.
   *
   * @type {string[]}
   */
  params: string[];
  /**
   * An optional prefix sent by the server
   *
   * @type {?string}
   */
  prefix?: IPrefix;
}

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
  nick(nickname: string): Promise<unknown>;
  privateMessage(msgtarget: string, text: string): void;
  on(
    event: 'PRIVMSG',
    listener: (prefix: IPrefix, msgTarget: string, text: string) => void
  ): void;
  on(
    event: 'JOIN',
    listener: (channel: string, nickName: string) => void
  ): void;
  on(
    event: 'PART',
    listener: (channel: string, nickName: string) => void
  ): void;
  on(
    event: 'NICK',
    listener: (previousNickName: string, newNickName: string) => void
  ): void;
  quit(message?: string): Promise<unknown>;
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

type SupportedCommands = 'USER' | 'JOIN' | 'PART' | 'NICK' | 'PRIVMSG' | 'QUIT';

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

interface IRCParserInterface {
  /**
   * This function parses the input provided in the Parser.
   * It throw an error if the input provided is wrong otherwise
   * returns the parsed message.
   *
   * @returns {IRCMessage}
   */
  parse(): IRCMessage;
}

export {
  JoinCommand,
  PartCommandProps,
  IRCClientInterface,
  IChannelDetails,
  ChannelDetails,
  CommandWaitingForReply,
  SupportedCommands,
  IPrefix,
  IRCMessage,
  IRCParserInterface
};
