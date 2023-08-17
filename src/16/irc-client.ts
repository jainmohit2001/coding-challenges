import net from 'net';
import { IRCMessage, IRCParser } from './parser';
import { Logger } from 'winston';
import { IRCReplies } from './command-types';
import { Queue } from '../utils/queue';
import {
  ChannelDetails,
  CommandWaitingForReply,
  IChannelDetails,
  IRCClientInterface,
  JoinCommand,
  PartCommandProps,
  SupportedCommands
} from './types';
import { getParamWithoutSemiColon } from './utils';

export default class IRCClient implements IRCClientInterface {
  host;
  port;
  nickName;
  realName;
  connected = false;
  socket: net.Socket;
  debug: boolean = false;
  logger?: Logger;
  private commandsQueue: Queue<CommandWaitingForReply>;
  private channels: Map<string, IChannelDetails>;

  constructor(
    host: string,
    port: number,
    nickName: string,
    realName: string,
    debug: boolean = false,
    logger?: Logger
  ) {
    if (nickName.length > 9) {
      throw new Error('Length of nickname should be less than 10');
    }

    this.host = host;
    this.port = port;
    this.nickName = nickName;
    this.realName = realName;
    this.connected = false;
    this.socket = new net.Socket();
    this.debug = debug;
    this.logger = logger;
    this.commandsQueue = new Queue<CommandWaitingForReply>();
    this.channels = new Map<string, IChannelDetails>();
  }

  getChannelDetails(channel: string): IChannelDetails | undefined {
    return this.channels.get(channel);
  }

  connect(): Promise<unknown> {
    return new Promise((res, rej) => {
      this.socket.connect(this.port, this.host, () => {});

      this.socket.on('connect', () => {
        // Create initial message
        let message = `NICK ${this.nickName}\r\n`;
        message += `USER guest 0 * :${this.realName}\r\n`;

        const elem = new CommandWaitingForReply(res, rej, 'USER');
        this.commandsQueue.enqueue(elem);

        // Send the message to server
        this.socket.write(message);

        // We are settings the connected to true since the socket is now open
        this.connected = true;

        if (this.debug && this.logger) {
          this.logger.info('Connected to Server');
        }
      });

      this.socket.on('data', (data) => {
        this.handleDataFromServer(data.toString());
      });

      this.socket.on('error', (error) => {
        if (this.debug && this.logger) {
          this.logger.error(error);
        }
        rej(error);
      });

      this.socket.on('close', () => {
        if (this.debug && this.logger) {
          this.logger.info('Disconnected from server');
        }
        this.connected = false;
      });
    });
  }

  disconnect(): Promise<void> {
    return new Promise<void>((res) => {
      this.socket.destroy();
      this.socket.on('close', () => {
        res();
      });
    });
  }

  join(channels: JoinCommand[]): Promise<unknown> {
    if (channels.length === 0) {
      throw new Error('No channel provided');
    }

    // TODO: Add Support for multiple channels
    if (channels.length > 1) {
      throw new Error('Only one channel allowed at a time');
    }

    let channelList = channels[0].channel;
    let keyList = channels[0].key !== undefined ? channels[0].key : '';

    for (let i = 1; i < channels.length; i++) {
      channelList += ',' + channels[i].channel;
      keyList += ',' + channels[i].key !== undefined ? channels[i].key : '';
    }

    return this.waitForReply('JOIN', [channelList, keyList]);
  }

  part(props: PartCommandProps): Promise<unknown> {
    if (props.channels.length === 0) {
      throw new Error('No channels provided');
    }

    // TODO: Add PART support for multiple channels
    if (props.channels.length > 1) {
      throw new Error('Only one channel allowed at a time during PART command');
    }

    const params = [props.channels.join(',')];

    if (props.partMessage !== undefined) {
      params.push(':' + props.partMessage);
    }

    return this.waitForReply('PART', params);
  }

  private waitForReply(
    command: SupportedCommands,
    params: string[]
  ): Promise<unknown> {
    // Check if socket is open
    if (!(this.socket && this.socket.readyState === 'open')) {
      throw new Error('Connection to server is not open');
    }

    // Initialize message to command
    let message = command;

    // Add params
    if (params !== undefined) {
      for (let i = 0; i < params.length; i++) {
        message += ' ' + params[i];
      }
    }

    // Log if required
    if (this.debug && this.logger) {
      this.logger.info('sent ' + message);
    }

    // Create a promise and push it to the commandsQueue
    const promise = new Promise((res, rej) => {
      const elem = new CommandWaitingForReply(res, rej, command);
      this.commandsQueue.enqueue(elem);
    });

    // Add the trailing CRLF and send message to server
    this.socket.write(message + '\r\n');
    return promise;
  }

  private sendMessage(command: string, params: string[]) {
    // Check if socket is open
    if (!(this.socket && this.socket.readyState === 'open')) {
      throw new Error('Connection to server is not open');
    }

    // Initialize message to command
    let message = command;

    // Add params
    if (params !== undefined) {
      for (let i = 0; i < params.length; i++) {
        message += ' ' + params[i];
      }
    }

    // Log if required
    if (this.debug && this.logger) {
      this.logger.info('sent ' + message);
    }

    // Add the trailing CRLF and send message to server
    this.socket.write(message + '\r\n');
  }

  private handleDataFromServer(data: string) {
    // The server can send multiple messages in a single data stream
    const messages = data.split('\r\n');
    const parsedMessages: IRCMessage[] = [];

    messages.forEach((str) => {
      if (this.debug && this.logger) {
        this.logger.info('received ' + str);
      }

      // Bypassing empty messages
      if (str.length > 0) {
        try {
          const parsedMessage = new IRCParser(str).parse();
          parsedMessages.push(parsedMessage);
        } catch (e) {
          this.logger?.error(`${e} str: ${str}`);
        }
      }
    });

    parsedMessages.forEach((message) => {
      switch (message.command) {
        case IRCReplies.PING:
          this.handlePing(message);
          break;
        case IRCReplies.NOTICE:
          this.handleNotice(message);
          break;
        case IRCReplies.RPL_WELCOME:
        case IRCReplies.RPL_YOURHOST:
        case IRCReplies.RPL_CREATED:
        case IRCReplies.RPL_MYINFO:
          this.handleWelcomeMessage(message);
          break;
        case IRCReplies.JOIN:
          this.handleJoinResponse(message);
          break;
        case IRCReplies.PART:
          this.handlePartResponse(message);
          break;
        case IRCReplies.ERR_BANNEDFROMCHAN:
        case IRCReplies.ERR_INVITEONLYCHAN:
        case IRCReplies.ERR_BADCHANNELKEY:
        case IRCReplies.ERR_CHANNELISFULL:
        case IRCReplies.ERR_BADCHANMASK:
        case IRCReplies.ERR_NOSUCHCHANNEL:
        case IRCReplies.ERR_TOOMANYCHANNELS:
        case IRCReplies.ERR_NOTONCHANNEL:
          this.handleChannelErrorResponse(message);
          break;
        case IRCReplies.RPL_NAMREPLY:
          this.handleNameReply(message);
          return;
        case IRCReplies.RPL_TOPIC:
        case IRCReplies.RPL_NOTOPIC:
          this.handleTopicResponse(message);
          break;
      }
    });
  }

  private handlePartResponse(message: IRCMessage) {
    // TODO: handle the case when some other leaves a channel

    // Leaving the ":" character out
    const channel = getParamWithoutSemiColon(message.params[0]);
    const partMessage = getParamWithoutSemiColon(message.params[1]);

    this.channels.delete(channel);
    const elem = this.commandsQueue.dequeue();

    if (elem?.command === 'PART') {
      elem.resolve(partMessage);
      return;
    }
    elem?.reject(new Error(`Invalid element ${elem} received from the queue`));
  }

  private handleNameReply(message: IRCMessage) {
    const params = message.params;
    const channelType = params[1];
    const channel = this.channels.get(params[2])!;

    const trailing = params[3].substring(1, params[3].length).split(' ');

    trailing.forEach((nickName) => {
      channel.names.add(nickName);
    });
  }

  private handleJoinResponse(message: IRCMessage) {
    // TODO: add support for when other user's join the channel

    // leaving out the first ":" char
    const channel = getParamWithoutSemiColon(message.params[0]);

    const elem = this.commandsQueue.dequeue();
    const channelDetails = new ChannelDetails(channel);
    this.channels.set(channel, channelDetails);

    if (elem?.command === 'JOIN') {
      elem.resolve('');
      return;
    }

    elem?.reject(new Error(`Invalid element ${elem} from queue received`));
  }

  private handleChannelErrorResponse(message: IRCMessage) {
    const elem = this.commandsQueue.dequeue();

    const channel = message.params[0];
    const info = getParamWithoutSemiColon(message.params[1]);

    if (elem !== undefined) {
      elem.reject(new Error(`${channel} ${info}`));
    }
  }

  private handleTopicResponse(message: IRCMessage) {
    const channel = message.params[0];
    const topic = getParamWithoutSemiColon(message.params[1]);
    let channelDetails = this.channels.get(channel);

    if (message.command === IRCReplies.RPL_NOTOPIC) {
      if (channelDetails !== undefined) {
        channelDetails.setTopic(null);
        this.channels.set(channel, channelDetails);
      } else {
        channelDetails = new ChannelDetails(channel);
      }
    } else if (message.command === IRCReplies.RPL_TOPIC) {
      channelDetails = new ChannelDetails(channel, topic);
    }

    if (channelDetails !== undefined) {
      this.channels.set(channel, channelDetails);
    }

    return;
  }

  private handleNotice(message: IRCMessage) {
    // TODO: Handle NOTICE messages
  }

  private handlePing(message: IRCMessage) {
    this.sendMessage('PONG', message.params);
  }

  private handleWelcomeMessage(message: IRCMessage) {
    if (message.command === IRCReplies.RPL_MYINFO) {
      const elem = this.commandsQueue.dequeue();
      if (elem?.command === 'USER') {
        elem.resolve('Connected to Server');
      }
    }
  }
}
