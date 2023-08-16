export enum IRCCommands {
  // The server sends Replies 001 to 004 to a user upon successful registration.
  /**
   * "Welcome to the Internet Relay Network `<nick>`!`<user>`@`<host>`"
   */
  RPL_WELCOME = '001',
  /**
   * "Your host is `<servername>`, running version `<ver>`"
   */
  RPL_YOURHOST = '002',
  /**
   * "This server was created `<date>`"
   */
  RPL_CREATED = '003',
  /**
   * "`<servername>` `<version>` `<available user modes>`
   * `<available channel modes>`"
   */
  RPL_MYINFO = '004',

  /**
   * Sent by the server to a user to suggest an alternative server.
   * This is often used when the connection is refused
   * because the server is already full.
   *
   * "Try server `<server name>`, port `<port number>`"
   */
  RPL_BOUNCE = '005',

  /**
   * Parameters: `<msgtarget> <text>`
   */
  NOTICE = 'NOTICE',

  /**
   * Parameters: `<server1> [ <server2> ]`
   * @example PING tolsun.oulu.fi // Command to send a PING message to server
   *  PING WiZ tolsun.oulu.fi // Command from WiZ to send a PING message to server "tolsun.oulu.fi"
   *  PING :irc.funet.fi // Ping message sent by server "irc.funet.fi"
   */
  PING = 'PING',

  /**
   * Parameters: `<server> [ <server2> ]`
   * @example PONG csd.bu.edu tolsun.oulu.fi // PONG message from csd.bu.edu to tolsun.oulu.fi
   */
  PONG = 'PONG'
}
