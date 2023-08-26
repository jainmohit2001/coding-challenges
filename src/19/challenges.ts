import { randomInt } from 'crypto';
import fs from 'fs';
import { homedir } from 'os';
import path from 'path';
import jsdom from 'jsdom';

interface IChallenges {
  /**
   * Generate a random challenge from the given set of challenges.
   *
   * @returns {string}
   */
  getRandomChallenge(): string;

  /**
   * List out the challenges.
   *
   * @returns {string[]}
   */
  listChallenges(): string[];

  /**
   * Function to add a challenge to the local storage.
   * The input must be a valid URL, otherwise it will throw an Error.
   *
   * @param {string} str
   * @returns {string}
   */
  addChallenge(str: string): Promise<string>;
}

class Challenges implements IChallenges {
  /**
   * This is an initial data used for local storage initialization.
   *
   * @private
   */
  private initialData = {
    challenges: [
      {
        name: 'Write Your Own wc Tool',
        url: 'https://codingchallenges.fyi/challenges/challenge-wc'
      },
      {
        name: 'Write Your Own JSON Parser',
        url: 'https://codingchallenges.fyi/challenges/challenge-json-parser'
      },
      {
        name: 'Write Your Own Compression Tool',
        url: 'https://codingchallenges.fyi/challenges/challenge-huffman'
      },
      {
        name: 'Write Your Own cut Tool',
        url: 'https://codingchallenges.fyi/challenges/challenge-cut'
      },
      {
        name: 'Write You Own Load Balancer',
        url: 'https://codingchallenges.fyi/challenges/challenge-load-balancer'
      },
      {
        name: 'Write Your Own Sort Tool',
        url: 'https://codingchallenges.fyi/challenges/challenge-sort'
      },
      {
        name: 'Write Your Own Calculator',
        url: 'https://codingchallenges.fyi/challenges/challenge-calculator'
      },
      {
        name: 'Write Your Own Redis Server',
        url: 'https://codingchallenges.fyi/challenges/challenge-redis'
      },
      {
        name: 'Write Your Own grep',
        url: 'https://codingchallenges.fyi/challenges/challenge-grep'
      },
      {
        name: 'Write Your Own uniq Tool',
        url: 'https://codingchallenges.fyi/challenges/challenge-uniq'
      },
      {
        name: 'Write Your Own Web Server',
        url: 'https://codingchallenges.fyi/challenges/challenge-webserver'
      },
      {
        name: 'Write Your Own URL Shortener',
        url: 'https://codingchallenges.fyi/challenges/challenge-url-shortener'
      },
      {
        name: 'Write Your Own diff Tool',
        url: 'https://codingchallenges.fyi/challenges/challenge-diff'
      },
      {
        name: 'Write Your Own Shell',
        url: 'https://codingchallenges.fyi/challenges/challenge-shell'
      },
      {
        name: 'Write Your Own cat Tool',
        url: 'https://codingchallenges.fyi/challenges/challenge-cat'
      },
      {
        name: 'Write Your Own IRC Client',
        url: 'https://codingchallenges.fyi/challenges/challenge-irc'
      },
      {
        name: 'Write Your Own Memcached Server',
        url: 'https://codingchallenges.fyi/challenges/challenge-memcached'
      },
      {
        name: 'Write Your Own Spotify Client',
        url: 'https://codingchallenges.fyi/challenges/challenge-spotify'
      }
    ]
  };

  /**
   * All the operations will be performed around this data.
   *
   * @private
   */
  private data: {
    challenges: {
      name: string;
      url: string;
    }[];
  };

  /**
   * The path where the data will be stored.
   *
   * @private
   * @type {string}
   */
  private filePath: string;

  constructor() {
    this.filePath = path.join(homedir(), '.cc_challenges_list');
    if (fs.existsSync(this.filePath)) {
      this.data = JSON.parse(fs.readFileSync(this.filePath).toString());
    } else {
      this.data = this.initialData;
      this.saveToStorage();
    }
  }

  private saveToStorage() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data));
  }

  private isPresent(url: string): boolean {
    for (let i = 0; i < this.data.challenges.length; i++) {
      if (this.data.challenges[i].url.indexOf(url) >= 0) {
        return true;
      }
    }
    return false;
  }

  async addChallenge(str: string): Promise<string> {
    try {
      const url = new URL(str);
      if (!str.startsWith('https://codingchallenges.fyi')) {
        throw new Error(`Unable to add ${str}. Invalid domain`);
      }
      if (this.isPresent(str)) {
        throw new Error(`Unable to add ${str}. URL already present`);
      }
      const res = await fetch(url, {
        headers: { 'Content-Type': 'text/html' }
      });
      const html = await res.text();
      const dom = new jsdom.JSDOM(html);
      const titleElem = dom.window.document.getElementsByTagName('title')[0];
      if (!titleElem) {
        throw new Error(`Unable to add ${str}. No title element found in HTML`);
      }
      const title = titleElem.innerHTML.split('|')[0].trim();
      this.data.challenges.push({ name: title, url: str });
      this.saveToStorage();
      return title + ' ' + str;
    } catch (e) {
      console.error(`Unable to add ${str}. ${e}`);
      throw e;
    }
  }

  getRandomChallenge(): string {
    const challengesLength = this.data.challenges.length;
    const challenge = this.data.challenges[randomInt(challengesLength)];
    return challenge.name + ' ' + challenge.url;
  }

  listChallenges(): string[] {
    const output: string[] = [];
    this.data.challenges.forEach((value) => {
      output.push(value.name + ' ' + value.url);
    });
    return output;
  }
}

const Storage = new Challenges();
export default Storage;
