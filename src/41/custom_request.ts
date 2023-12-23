import https from 'https';
import http from 'http';

export type Stats = {
  body: string;
  statusCode: number;
  trtMs: number;
  ttfbMs: number;
  ttlbMs: number;
};

export function customRequest(url: string): Promise<Stats> {
  const protocol = url.startsWith('https') ? https : http;

  const stats: Stats = {
    body: '',
    statusCode: 0,
    trtMs: 0,
    ttfbMs: 0,
    ttlbMs: 0
  };

  const processTimes = {
    dnsLookup: BigInt(0),
    tcpConnection: BigInt(0),
    tlsHandshake: BigInt(0),
    responseBodyStart: BigInt(0),
    responseBodyEnd: BigInt(0)
  };

  // Ensure connections are not reused
  const agent = new protocol.Agent({
    keepAlive: false
  });

  return new Promise<Stats>((resolve, reject) => {
    // Close the connection after the request
    const options = {
      agent,
      headers: {
        Connection: 'close'
      }
    };

    const req = protocol.get(url, options, (res) => {
      stats.statusCode = res.statusCode ?? -1;

      // Handle redirects
      if (res.statusCode === 301 && res.headers.location) {
        const redirectUrl = res.headers.location;
        req.destroy();

        customRequest(redirectUrl)
          .then((redirectStats) => resolve(redirectStats))
          .catch((err) => reject(err));
        return;
      }

      res.once('data', () => {
        processTimes.responseBodyStart = process.hrtime.bigint();
        stats.ttfbMs =
          Number(processTimes.responseBodyStart - processTimes.tlsHandshake) /
          1000_000;
      });

      res.on('data', (d) => {
        stats.body += d;
      });

      res.on('end', () => {
        processTimes.responseBodyEnd = process.hrtime.bigint();
        stats.ttlbMs =
          Number(processTimes.responseBodyEnd - processTimes.tlsHandshake) /
          1000_000;
        stats.trtMs =
          Number(processTimes.responseBodyEnd - processTimes.dnsLookup) /
          1000_000;
        resolve(stats);
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('socket', (socket) => {
      socket.on('lookup', () => {
        processTimes.dnsLookup = process.hrtime.bigint();
      });
      socket.on('connect', () => {
        processTimes.tcpConnection = process.hrtime.bigint();
      });

      socket.on('secureConnect', () => {
        processTimes.tlsHandshake = process.hrtime.bigint();
      });
    });

    req.end();
  });
}
