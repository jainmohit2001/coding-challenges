# Solutions to John Crickett's Coding Challenges

## About

This repository contains my solutions to John Crickett's Coding Challenges. The challenges are available at [https://codingchallenges.fyi/challenges/intro](https://codingchallenges.fyi/challenges/intro).

Using Typescript as the language throughout the challenges.

Just trying to learn Typescript and improve my problem solving skills.

I am also trying to incorporate testing, documentation and a better GIT control.

Checkout my [Notion](https://mohitjain.notion.site/Coding-Challenges-af9b8197a438447e9b455ab9e010f9a2?pvs=4) where I share how I tackled these challenges, along with my learnings.

## Structure

- `src` - Contains all the source code
- `tests` - Contains all the test files

## Challenges

1. [Write your own wc tool](src/1/)
2. [Write your own JSON parser](src/2/)
3. [Write Your Own Compression Tool](src/3/)
4. [Write Your Own cut Tool](src/4/)
5. [Write You Own Load Balancer](src/5/)
6. [Write Your Own Sort Tool](src/6/)
7. [Write Your Own Calculator](src/7/)
8. [Write Your Own Redis Server](src/8/)
9. [Write your own grep](src/9/)
10. [Write Your Own uniq Tool](src/10/)
11. [Write Your Own Web Server](src/11/)
12. [Write Your Own URL Shortener](https://github.com/jainmohit2001/short-url)
13. [Write Your Own diff Tool](src/13/)
14. [Write Your Own Shell](src/14/)
15. [Write Your Own cat Tool](src/15/)
16. [Write Your Own IRC Client](src/16/)
17. [Write Your Own Memcached Server](src/17/)
18. [Write Your Own Spotify Client](https://github.com/jainmohit2001/spotify-client)
19. [Write Your Own Discord Bot](src/19/)
20. [Write Your Own LinkedIn Carousel Generator](https://github.com/jainmohit2001/carousel-gen)

## Installation

The following command will build all the .ts files present in `src` folder into a new `build` folder.

```bash
npm install
npm run build
```

## Testing

The following command will run all the tests present under the `tests` folder and create the coverage report in `coverage` folder.

All the relevant required test input files are present in tests folder itself.

```bash
npm test
```

To run tests for specific challenge, use the following command:

```bash
# npm test src/<challenge-number>/
npm test src/2/
npm test src/3/
```
