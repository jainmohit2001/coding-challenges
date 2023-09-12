import { randomBytes } from 'crypto';
import DnsQuery from '../dns_query';

describe('Testing dns query', () => {
  let client: DnsQuery;

  it('should send and receive message with same id', async () => {
    const host = '8.8.8.8';
    const port = 53;
    const domain = 'dns.google.com';
    client = new DnsQuery(domain, host, port, false);
    const headerId = parseInt(randomBytes(2).toString('hex'), 16);
    const response = await client.sendMessage({ id: headerId, rd: 1 });
    expect(response.header.id).toBe(headerId);
  });
});
