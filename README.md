# Solutions to John Crickett's Coding Challenges

## About

This repository contains my solutions to John Crickett's Coding Challenges. The challenges are available at [https://codingchallenges.fyi/challenges/intro](https://codingchallenges.fyi/challenges/intro).

Language used - Typescript

Checkout my [Notion](https://mohitjain.notion.site/Coding-Challenges-af9b8197a438447e9b455ab9e010f9a2?pvs=4) where I share how I tackled these challenges, along with my learnings.

## Challenges

1. [Write your own wc tool](src/1/)
2. [Write your own JSON parser](src/2/)
3. [Write Your own Compression Tool](src/3/)
4. [Write Your own cut Tool](src/4/)
5. [Write Your own Load Balancer](src/5/)
6. [Write Your own Sort Tool](src/6/)
7. [Write Your own Calculator](src/7/)
8. [Write Your own Redis Server](src/8/)
9. [Write your own grep](src/9/)
10. [Write Your own uniq Tool](src/10/)
11. [Write Your own Web Server](src/11/)
12. [Write Your own URL Shortener](https://github.com/jainmohit2001/short-url)
13. [Write Your own diff Tool](src/13/)
14. [Write Your own Shell](src/14/)
15. [Write Your own cat Tool](src/15/)
16. [Write Your own IRC Client](src/16/)
17. [Write Your own Memcached Server](src/17/)
18. [Write Your own Spotify Client](https://github.com/jainmohit2001/spotify-client)
19. [Write Your own Discord Bot](src/19/)
20. [Write Your own LinkedIn Carousel Generator](https://github.com/jainmohit2001/carousel-gen)
21. [Write Your own Sed](src/21/)
22. [Write Your own DNS Resolver](src/22/)
23. [Write Your own Traceroute](src/23/)
24. [Write Your own Realtime Chat Client and Server - Duplicate of Write Your Own IRC Client](src/16/)
25. [Write Your own NATS Message Broker](src/25/)
26. [Write Your own Git](src/26/)
27. [Write Your own Rate Limiter](src/27/)
28. [Write Your own NTP Client](src/28/)

...

41. [Write Your Own HTTP(S) Load Tester](src/41/)

## Installation

The following command will build all the .ts files present in the `src` folder into a new `build` folder.

```bash
npm install
npm run build
```

## Testing

The following command will run all the tests under the `__tests__` folder and create the coverage report in the `coverage` folder.

All the required test input files are in the individual `__tests__` folder for each challenge.

```bash
npm test
```

To run tests for a specific challenge, use the following command:

```bash
# npm test src/<challenge-number>/
npm test src/2/
npm test src/3/
```
