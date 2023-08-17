/**
 * This is the format in which the prefix element is present in server messages.
 * The format follows the following BNF form:
 *
 * `servername / ( nickname [ [ "!" user ] "@" host ] )`
 *
 * There is no space allowed in the prefix.
 *
 * @interface IPrefix
 */
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

/**
 * Used as the parameter type for JOIN command.
 * @example
 * ```ts
 * // Joining a single channel '#cc' with no key
 * await client.join([(channel: '#cc')])
 * ```
 *
 * @interface JoinCommand
 */
interface JoinCommand {
  /**
   * The name of the channel
   *
   * @type {string}
   */
  channel: string;

  /**
   * An optional key if required to join the channel
   *
   * @type {?string}
   */
  key?: string;
}

/**
 * Used as the parameter type for PART command.
 *
 * @example
 * ```ts
 * // Leaving channel '#cc' with message 'Bye Bye'
 * await client.part({channel: ['#cc'], partMessage: 'Bye Bye'})
 * ```
 *
 * @interface PartCommandProps
 */
interface PartCommandProps {
  /**
   * List of channels that the user wants to leave.
   *
   * @type {string[]}
   */
  channels: string[];

  /**
   * Parting message for the channels.
   *
   * @type {?string}
   */
  partMessage?: string;
}

interface IRCClientInterface {
  /**
   * Host of IRC Server.
   *
   * @type {string}
   */
  host: string;

  /**
   * Port exposed by IRC Server.
   *
   * @type {number}
   */
  port: number;

  /**
   * Nick Name the user wants to connect with.
   *
   * @type {string}
   */
  nickName: string;

  /**
   * Real Name of the user.
   *
   * @type {string}
   */
  realName: string;

  /**
   * Signifies whether the client is connected to the server or not.
   * If the socket is in open state then it is true.
   * Otherwise false.
   *
   * @type {boolean}
   */
  connected: boolean;

  /**
   * Function to connect with the server.
   * It is resolved when the server sends a Welcome message with code 004.
   *
   * @returns {Promise<unknown>}
   */
  connect(): Promise<unknown>;

  /**
   * Function to disconnect with the server.
   * This is NOT a graceful disconnection with the server.
   * It will NOT send a QUIT command.
   *
   * @returns {Promise<void>}
   */
  disconnect(): Promise<void>;

  /**
   * Function used to JOIN channels.
   *
   * @param {JoinCommand[]} channels
   * @returns {Promise<unknown>}
   */
  join(channels: JoinCommand[]): Promise<unknown>;

  /**
   * Function used to Leave(PART) channels.
   *
   * @param {PartCommandProps} props
   * @returns {Promise<unknown>}
   */
  part(props: PartCommandProps): Promise<unknown>;

  /**
   * Function to change Nick name of the user.
   *
   * @param {string} nickname
   * @returns {Promise<unknown>}
   */
  nick(nickname: string): Promise<unknown>;

  /**
   * Function to send a private message to the given msgtarget.
   * It can be a channel name of the nick name of the user.
   *
   * @param {string} msgtarget
   * @param {string} text
   */
  privateMessage(msgtarget: string, text: string): void;

  /**
   * Listeners allowed on the following events:
   *  1) PRIVMSG
   *  2) JOIN
   *  3) PART
   *  4) NICK
   *
   * These events are fired when the message corresponds to a different user.
   */
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

  /**
   * Function to send QUIT command to the server.
   * It is resolved when the socket emits the close event.
   *
   * @param {?string} [message]
   * @returns {Promise<unknown>}
   */
  quit(message?: string): Promise<unknown>;

  /**
   * Function used to get details about a channel that the user is part of.
   *
   * @param {string} channel
   * @returns {(IChannelDetails | undefined)}
   */
  getChannelDetails(channel: string): IChannelDetails | undefined;
}

interface IChannelDetails {
  /**
   * The name of the channel.
   *
   * @type {string}
   */
  channel: string;

  /**
   * The topic of the channel.
   *
   * @type {(string | null)}
   */
  topic: string | null;

  /**
   * The list of nick name of the users present in this channel.
   *
   * @type {Set<string>}
   */
  names: Set<string>;

  /**
   * Function used to update the channel topic.
   *
   * @param {(string | null)} topic
   */
  setTopic(topic: string | null): void;

  /**
   * Function used to set the names present in the channel.
   *
   * @param {Set<string>} names
   */
  setNames(names: Set<string>): void;

  /**
   * Function used to add a name to the list of users.
   *
   * @param {string} name
   */
  addName(name: string): void;

  /**
   * Function used to remove a name from the list of users.
   *
   * @param {string} name
   */
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
