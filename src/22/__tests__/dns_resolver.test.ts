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
    const response = await client.sendMessage();
    expect(response.header.id).toBeGreaterThan(0);
  });
});
