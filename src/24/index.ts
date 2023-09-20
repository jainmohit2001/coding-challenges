import NATSServer from './server';

const PORT = 4222;
const HOST = undefined;
let DEBUG = false;

for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--debug') {
    DEBUG = true;
  }
}
const server = new NATSServer(PORT, HOST, DEBUG);

server.startServer();
