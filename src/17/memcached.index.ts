import MemCachedServer from './memcached';

let port = 11211;
const host = '127.0.0.1';

for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg === '-p') {
    try {
      port = parseInt(process.argv[i + 1]);
    } catch (e) {
      console.error('Invalid port provided');
      process.exit(1);
    }
  }
}

async function main() {
  const server = new MemCachedServer(port, host);
  server.startServer();
}

main();
