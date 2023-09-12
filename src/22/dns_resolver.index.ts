import { DnsResolver } from './dns_resolver';

const USAGE = `
Usage:
node dns_resolved.ts <host-name>
\tWhere <host-name> is the host name (e.g. dns.google.com)
\tfor which DNS resolution needs to be performed 
`;

function printUsage(exit: boolean) {
  console.info(USAGE);
  if (exit) {
    process.exit(1);
  }
}

if (process.argv.length < 3) {
  printUsage(true);
}

const domain = process.argv[2];

const rootServer = '198.41.0.4';
const maxCount = 10;
const debug = true;

const dnsResolver = new DnsResolver(domain, rootServer, debug, maxCount);
dnsResolver
  .resolve()
  .then((value) => {
    console.log(value);
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
