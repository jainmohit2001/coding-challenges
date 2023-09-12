import { randomBytes } from 'crypto';
import DnsResolver from '../dns_resolver';

describe('Testing dns resolver', () => {
  const host = '8.8.8.8';
  const port = 53;
  const domain = 'dns.google.com';
  let client: DnsResolver;

  beforeAll(() => {
    client = new DnsResolver(domain, host, port, false);
  });

  afterAll(() => {
    client.close();
  });

  it('should send and receive message with same id', async () => {
    const headerId = parseInt(randomBytes(2).toString('hex'), 16);
    const response = await client.sendMessage({ id: headerId });
    expect(response.header.id).toBe(headerId);
  });
});
