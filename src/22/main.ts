import DnsResolver from './dns_resolver';

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

const host = '198.41.0.4';
const port = 53;

const resolver = new DnsResolver(domain, host, port, true);

resolver
  .sendMessage({ rd: 1 })
  .then((value) => {
    console.log(value);
    resolver.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    resolver.close();
    process.exit(1);
  });
