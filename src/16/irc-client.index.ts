import IRCClient from './irc-client';
import readline from 'readline';
import { createLogger, transports, format } from 'winston';
import path from 'path';

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt() {
  rl.question('client>', async (line) => {
    if (line === 'exit') {
      await client.disconnect();
      process.exit(0);
    } else if (line === 'connect') {
      if (client && client.connected) {
        return;
      }
      await connect();
      prompt();
    } else {
      prompt();
    }
  });
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
