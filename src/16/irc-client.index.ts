import IRCClient from './irc-client';
import readline from 'readline';
import { createLogger, transports, format } from 'winston';
import path from 'path';
import { JoinCommand, PartCommandProps } from './types';

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

    switch (command) {
      case 'exit':
        return await handleExit();
      case 'connect':
        return await handleConnect();
      case '/join':
        return await handleJoin(input.slice(1, input.length));
      case '/part':
        return await handlePart(input.slice(1, input.length));
      default:
        console.error('Invalid command');
        prompt();
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
    console.error('No channels provided to join');
    return prompt();
  }

  // Allowing only one channel to join right now
  // TODO: Add support for multiple channels
  if (channels.length > 1) {
    console.error('Only allowed to join one channel at a time');
    return prompt();
  }
  const props: JoinCommand[] = [];

  channels.forEach((channel) => {
    props.push({ channel });
  });

  try {
    await client.join(props);
  } catch (e) {
    console.error(e);
  }

  return prompt();
}

async function handlePart(channels: string[]) {
  if (channels.length === 0) {
    console.error('No channels provided to join');
    return prompt();
  }

  // Allowing only one channel to join right now with no part message
  // TODO: Add support for multiple channels
  if (channels.length > 1) {
    console.error(
      `Only allowed to join one channel at a time.
      The support for part message is not available yet`
    );
    return prompt();
  }

  const props: PartCommandProps = { channels: channels };
  await client.part(props);

  return prompt();
}

prompt();

const host = 'irc.freenode.net';
const port = 6667;
const nickName = 'MJ';
const fullName = 'Mohit Jain';
const debug = true;
let client: IRCClient;

async function connect() {
  client = new IRCClient(host, port, nickName, fullName, debug, logger);
  await client.connect();
}
