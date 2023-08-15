import IRCClient from '../../src/16/irc-client';

describe('Testing IRC Client', () => {
  const host = 'irc.freenode.net';
  const port = 6667;
  const nickName = 'MJ';
  const fullName = 'Mohit Jain';
  let client: IRCClient;

  afterEach(() => {
    client.disconnect();
  });

  it('Should connect to server successfully', async () => {
    client = new IRCClient(host, port, nickName, fullName);
    await client.connect();
    expect(client.connected).toBe(true);
  });
});
