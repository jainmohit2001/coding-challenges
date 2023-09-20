import NATSServer from './server';

const PORT = 4222;

const server = new NATSServer(PORT);

server.startServer();
