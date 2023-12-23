import { customRequest } from '../custom_request';

describe('Testing custom request', () => {
  it('should handle redirects', async () => {
    const url = 'https://google.com';
    const stats = await customRequest(url);
    expect(stats.statusCode).toBe(200);
  });

  it('should handle http requests', async () => {
    const url = 'http://google.com';
    const stats = await customRequest(url);
    expect(stats.statusCode).toBe(200);
  });

  it('should handle https requests', async () => {
    const url = 'https://www.google.com';
    const stats = await customRequest(url);
    expect(stats.statusCode).toBe(200);
  });

  it('should raise error on invalid URL', (done) => {
    const url = 'http://123213213123123.com';
    customRequest(url).catch(() => done());
  });

  it('should raise error on invalid protocol', (done) => {
    const url = '123213213123123.com';
    customRequest(url).catch(() => done());
  });
});
