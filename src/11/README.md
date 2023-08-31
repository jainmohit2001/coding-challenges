# Challenge 11 - Write Your Own Web Server

This challenge corresponds to the eleventh part of the Coding Challenges series by John Crickett https://codingchallenges.fyi/challenges/challenge-webserver.

## Description

The web server API implementation is inspired from (express)[https://www.npmjs.com/package/express].
The webserver is a basic implementation and a subpart of the express framework.
It current handles only GET requests and supports responses and file responses.
The webserver is able to handle the case when the callback to a GET function throws an error, by sending a 500 response.

- `webserver.ts`: Contains the implementation of the web server, implemented using the `net` module of Node.js. It exposes `startServer`, `stopServer` and `get` methods to start, stop and handle GET requests respectively.
- `index.ts`: A simple example of how to use the web server and serve a HTML file.
- `request.ts`: A simple implementation of the request object that is passed to the callback of the `get` method.
- `status_codes.ts`: Contains the supported status codes and their corresponding messages that are used in the response.

## Usage

You can directly import the HttpServer class from the `webserver.ts` file and use it as follows:

```typescript
import { HttpServer } from './webserver';

// Create a new instance of the HttpServer class with
const HOST = '127.0.0.1';
const PORT = 8000;
const debug = false;
const webServer = new HttpServer(HOST, PORT, debug);

// Handle GET requests
webServer.get('/', (req) => {
  res.send('Hello World!');
});

// Serve a HTML file
webServer.get('/index.html', (req) => {
  req.sendFile('path/to/index.html');
});

// Start the server
webServer.startServer();
```

## Run tests

To run the tests for the webserver, go to the root directory of this repository and run the following command:

```bash
npm run test tests/11/
```

The tests are located in the `tests/11/` directory.
