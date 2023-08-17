import IRCClient from './irc-client';
import readline from 'readline';
import { createLogger, transports, format } from 'winston';
import path from 'path';
import { JoinCommand, PartCommandProps } from './types';

const host = 'irc.freenode.net';
const port = 6667;
const nickName = 'MJ';
const fullName = 'Mohit Jain';
const debug = true;
let client: IRCClient;

// File logger
const logger = createLogger({
  transports: [
    new transports.File({
      dirname: path.join(process.cwd(), 'logs'),
      filename: 'irc_client.log'
    })
  ],
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} ${message}`;
    })
  )
});

// Read input from user
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Function to prompt input from user.
 */
function prompt() {
  rl.question('client>', async (line) => {
    const input = line.trim().split(' ');
    const command = input[0];
    try {
      switch (command) {
        case 'exit':
          return await handleExit();
        case 'connect':
          return await handleConnect();
        case '/join':
          return await handleJoin(input.slice(1, input.length));
        case '/part':
          return await handlePart(
            line.substring(command.length, line.length).trim()
          );
        case '/nick':
          return await handleNick(input[1]);
        case '/privmsg':
          return await handlePrivMsg(input.slice(1, input.length));
        case '/quit':
          return await handleQuit(input[1]);
        default:
          console.error('Invalid command');
          prompt();
      }
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      } else {
        console.error(e);
      }
    }
  });
}

async function handleExit() {
  await client.disconnect();
  return process.exit(0);
}

async function handleConnect() {
  // If client is already connected
  if (client && client.connected) {
    return;
  }

  await connect();
  return prompt();
}

async function handleJoin(channels: string[]) {
  if (channels.length === 0) {
    throw new Error('No channels provided to join');
  }

  // Allowing only one channel to join right now
  // TODO: Add support for multiple channels
  if (channels.length > 1) {
    throw new Error('Only allowed to join one channel at a time');
  }
  const props: JoinCommand[] = [];

  channels.forEach((channel) => {
    props.push({ channel });
  });

  await client.join(props);
  return prompt();
}

/**
 * The `args` present in the parameter is of the following format:
 * "#foo,#bar leaving channel"
 * The channels are separated by a comma.
 * Afterwards an optional PART message is present
 *
 * @async
 * @param {string} args
 */
async function handlePart(args: string) {
  let i = 0;

  // get the first space
  for (i; i < args.length; i++) {
    if (args[i] === ' ') {
      break;
    }
  }

  // Get channel and partMessage
  const channels = args.substring(0, i).split(',');
  const partMessage = args.substring(i, args.length);

  if (channels.length === 0) {
    throw new Error('No channels provided to join');
  }

  // Allowing only one channel to join right now
  // TODO: Add support for multiple channels
  if (channels.length > 1) {
    throw new Error(
      'Only allowed to join one channel at a time. The support for part message is not available yet'
    );
  }

  const props: PartCommandProps = {
    channels: channels,
    partMessage: partMessage
  };
  await client.part(props);

  return prompt();
}

async function handleNick(nickName: string) {
  if (nickName.length > 9 || nickName.length === 0) {
    throw new Error('Invalid nickname provided');
  }
  await client.nick(nickName);

  return prompt();
}

async function handlePrivMsg(args: string[]) {
  const msgTarget = args[0];
  const text = args[1];

  if (msgTarget === undefined || text === undefined) {
    throw new Error('Invalid target or message text');
  }
  client.privateMessage(msgTarget, text);
  return prompt();
}

async function connect() {
  client = new IRCClient(host, port, nickName, fullName, debug, logger);
  await client.connect();
}

async function handleQuit(message?: string) {
  await client.quit(message);
  return prompt();
}

prompt();
