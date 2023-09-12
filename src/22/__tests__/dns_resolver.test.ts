import { randomBytes } from 'crypto';
import { DnsResolver } from '../dns_resolver';

describe('Testing DNS resolver', () => {
  const validDomains = ['dns.google.com', 'evyenergy.com', 'facebook.com'];
  const invalidDomains = [
    randomBytes(16).toString('hex') + '.com',
    'dns.google.com234567890'
  ];

  validDomains.forEach((domain) => {
    it(
      'should return valid IP string ' + domain,
      async () => {
        const resolver = new DnsResolver(domain);
        const result = await resolver.resolve();
        expect(typeof result).toBe('string');
      },
      10000
    );
  });

  invalidDomains.forEach((domain) => {
    it(
      'should throw error ' + domain,
      () => {
        const resolver = new DnsResolver(domain);
        expect(() => resolver.resolve()).rejects.toThrowError(
          'No record found!'
        );
      },
      10000
    );
  });
});
