import { program } from 'commander';
import { loadTester } from './load_tester';

program.option('-u <url>', 'URL to load test on');
program.option('-n <num>', 'Number of requests to make', '10');
program.option(
  '-c <concurrency>',
  'Number of concurrent requests to make',
  '1'
);

program.parse();

const { u, n, c } = program.opts();

try {
  new URL(u);
} catch (e) {
  console.error((e as Error).message);
  process.exit(1);
}

const numberOfRequests = parseInt(n);
const concurrency = parseInt(c);
const url = u.toString();

async function main() {
  const result = await loadTester({ numberOfRequests, concurrency, url });
  console.log(result);
}

main();
