# Challenge 4 - Write You Own Load Balancer

This challenge corresponds to the fifth part of the Coding Challenges series by John Crickett https://codingchallenges.fyi/challenges/challenge-load-balancer.

## Description

The aim of this challenge is to write a load balancer that distributes the incoming requests to the registered servers in a Round Robin fashion.

- `be_details.ts` - contains the class for the BE Server details stored with the Load balancer.
- `be.index.ts` - a command line tool to start a backend server.
- `be.ts` - Contains the backend server implementation.
- `enum.ts` - Contains relevant ENUMs for the SchedulingAlgorithm and the Health of a Backend Server.
- `lb.index.ts` - a command line tool to start the load balancer with ROUND_ROBIN scheduling algorithm.
- `lb.ts` - Contains the load balancer implementation.

## Usage

1. First we need to register the BE servers on the LB. To do so, find the private variable `backendServerUrls` and update it with the URLs of the BE servers.

   For the sake of explanation, the BE servers and LB are all hosted on the same machine. The LB is listening on port 80, and the BE servers are listening on port 8080, 8081 and 8082.

2. Start the load balancer using the command line tool `lb.index.ts` as follows:

   ```bash
   # Using node
   node path/to/lb.index.js 80

   # Using ts-node
   npx ts-node lb.index.ts 80
   ```

3. Start the BE servers using the command line tool `be.index.ts` as follows:

   ```bash
   # Using node
   node path/to/be.index.js 8081

   # Using ts-node
   npx ts-node be.index.ts 8081
   ```

4. Add more BE servers using the above command with different ports.

5. Start sending requests using any preferred tool (e.g. Postman) to the LB on port 80. The LB will distribute the requests to the BE servers in a Round Robin fashion.

6. Cross check the **Health Check Mechanism** by stopping one of the BE servers. The LB will stop sending requests to the unhealthy BE server.

## Run tests

To run the tests for the Load Balancer, go to the root directory of this repository and run the following command:

```bash
npm run test tests/5/
```

The tests are located in the `tests/5/` directory.
