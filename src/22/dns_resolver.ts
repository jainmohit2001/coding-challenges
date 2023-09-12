import DnsQuery from './dns_query';
import { ClassValues, TypeValues } from './enums';
import { IDnsMessage, IResourceRecord } from './types';

/**
 * This is the main DNS Resolver class.
 */
export class DnsResolver {
  private domain: string;
  private rootServer: string;
  private port: number = 53;
  private maxCount: number;
  private debug: boolean;

  constructor(
    domain: string,
    rootServer: string = '198.41.0.4',
    debug: boolean = false,
    maxCount: number = 10
  ) {
    this.domain = domain;
    this.rootServer = rootServer;
    this.maxCount = maxCount;
    this.debug = debug;
  }

  /**
   * Check if answers exists in the message.
   * Otherwise check if more information for NS records are present.
   *
   * @private
   * @param {IDnsMessage} message
   * @returns {(string | null)}
   */
  private checkForSolution(message: IDnsMessage): string | null {
    if (message.answers.length > 0) {
      return message.answers[0].data;
    }

    if (!(message.authority.length > 0 && message.additional.length > 0)) {
      throw new Error('No record found!');
    }

    return null;
  }

  /**
   * Get a valid address for the next hop from the list of additional RRs.
   * If no record found then throw an Error.
   *
   * @private
   * @param {IResourceRecord[]} additional
   * @returns {string}
   */
  private getValidNextServer(additional: IResourceRecord[]): string {
    for (let i = 0; i < additional.length; i++) {
      const rrType = additional[i].type;
      const rrClass = additional[i].class;
      if (
        (rrType === TypeValues.A || rrType === TypeValues.NS) &&
        rrClass === ClassValues.IN
      ) {
        return additional[i].data;
      }
    }

    throw new Error('No valid Next Server found');
  }

  private async dnsCall(server: string): Promise<IDnsMessage> {
    const resolver = new DnsQuery(this.domain, server, this.port, false);
    return await resolver.sendMessage({ rd: 1 });
  }

  /**
   * Main entry point for DNS resolution.
   *
   * @public
   * @async
   * @returns {Promise<string>}
   */
  public async resolve(): Promise<string> {
    const resolver = new DnsQuery(
      this.domain,
      this.rootServer,
      this.port,
      false
    );
    if (this.debug) {
      console.log('Querying %s for %s', this.rootServer, this.domain);
    }
    // First get response from root server
    const rootResponse = await resolver.sendMessage({ rd: 1 });

    // check if root server contains the answer.
    let answer = this.checkForSolution(rootResponse);
    if (answer) {
      return answer;
    }

    // Otherwise hop to the next server
    let nextServer = this.getValidNextServer(rootResponse.additional);
    // We perform the hop upto maxCount before throwing an Error.
    // If a solution is found in between, we will return it.
    for (let i = 0; i < this.maxCount; i++) {
      if (this.debug) {
        console.log('Querying %s for %s', nextServer, this.domain);
      }

      const response = await this.dnsCall(nextServer);

      answer = this.checkForSolution(response);
      if (answer) {
        return answer;
      }

      nextServer = this.getValidNextServer(response.additional);
    }

    throw new Error(`Reached maximum hop count ${this.maxCount}`);
  }
}
