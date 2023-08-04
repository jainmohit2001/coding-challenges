import path from 'path';
import { HttpServer } from './webserver';
const HOST = '127.0.0.1';
const PORT = 8000;
const dir = path.join(__dirname, 'www');

const createWebServer = (
  host: string = HOST,
  port: number = PORT
): HttpServer => {
  const webServer: HttpServer = new HttpServer(host, port);

  webServer.get('/', (request) => {
    request.send('Requested path: ' + request.path);
  });

  webServer.get('/index.html', async (request) => {
    await new Promise((res) => setTimeout(res, 5000));
    request.sendFile(path.join(dir, 'index.html'));
  });

  webServer.get('/throw-error', async () => {
    throw new Error('Some error occurred');
  });

  // Uncomment the below code to start the server using the following command
  //    node /build/src/11/index.js
  // webServer.startServer();
  return webServer;
};

export { createWebServer };
