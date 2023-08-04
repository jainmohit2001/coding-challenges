import axios from 'axios';
import { webServer } from '../../src/11';
import { HttpServer } from '../../src/11/webserver';

describe('Testing WebServer', () => {
  const server: HttpServer = webServer;
  const baseUrl = `http://${server.host}:${server.port}`;
  const timeout = 30000;

  beforeAll(() => {
    server.startServer();
  });

  test(
    'Testing simple Get request',
    async () => {
      const url = baseUrl + '/';
      const response = await axios.get(url);
      expect(response.data).toBe('Requested path: /\r\n');
    },
    timeout
  );

  test(
    'Serving HTML files',
    async () => {
      const url = baseUrl + '/index.html';
      const response = await axios.get(url);
      expect(response.data).toContain('Simple Web Page');
    },
    timeout
  );

  test(
    'Server 500 error code',
    async () => {
      const url = baseUrl + '/throw-error';
      const response = await axios.get(url, { validateStatus: () => true });
      expect(response.status).toBe(500);
    },
    timeout
  );

  test(
    'Invalid path',
    async () => {
      const url = baseUrl + '/invalid-path';
      const response = await axios.get(url, { validateStatus: () => true });
      expect(response.status).toBe(404);
    },
    timeout
  );

  test(
    'Concurrent clients',
    async () => {
      const url = baseUrl + '/index.html';
      const responses = await Promise.all([
        axios.get(url),
        axios.get(url),
        axios.get(url),
        axios.get(url),
        axios.get(url),
        axios.get(url),
        axios.get(url),
        axios.get(url),
        axios.get(url),
        axios.get(url)
      ]);
      responses.forEach((response) => {
        expect(response.data).toContain('Simple Web Page');
      });
    },
    timeout
  );

  afterAll(() => {
    server.stopServer();
  });
});
