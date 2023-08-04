import path from 'path';
import { HttpServer } from './webserver';
const host = '127.0.0.1';
const port = 80;
const dir = path.join(__dirname, 'www');

const webServer: HttpServer = new HttpServer(host, port);

webServer.get('/', (request) => {
  request.send('Requested path: ' + request.path, 200);
});

webServer.get('/index.html', async (request) => {
  await new Promise((res) => setTimeout(res, 10000));
  request.sendFile(path.join(dir, 'index.html'));
});

export { webServer };
