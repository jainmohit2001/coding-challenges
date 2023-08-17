export enum IRCReplies {
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
  PONG = 'PONG',

  /**
   * "`<channel>` :Cannot join channel (+b)"
   */
  ERR_BANNEDFROMCHAN = '474',

  /**
   * "`<channel>` :Cannot join channel (+i)"
   */
  ERR_INVITEONLYCHAN = '473',

  /**
   * "`<channel>` :Cannot join channel (+k)"
   */
  ERR_BADCHANNELKEY = '475',

  /**
   * "`<channel>` :Cannot join channel (+l)"
   */
  ERR_CHANNELISFULL = '471',

  /**
   * "`<channel>` :Bad Channel Mask"
   */
  ERR_BADCHANMASK = '476',

  /**
   * "`<channel name>` :No such channel"
   */
  ERR_NOSUCHCHANNEL = '403',

  /**
   * "`<channel>` :You're not on that channel"
   */
  ERR_NOTONCHANNEL = '442',

  /**
   * "`<channel name>` :You have joined too many channels"
   */
  ERR_TOOMANYCHANNELS = '405',

  /**
   * "`<target>` :`<error code>` recipients. `<abort message>`"
   */
  ERR_TOOMANYTARGETS = '407',

  /**
   * "`<nick/channel>` :Nick/channel is temporarily unavailable"
   */
  ERR_UNAVAILRESOURCE = '437',

  /**
   * "`<channel>` :No topic is set"
   */
  RPL_NOTOPIC = '331',

  /**
   * "`<channel>` :`<topic>`"
   */
  RPL_TOPIC = '332',

  /**
   * When a user sends a JOIN message and if it is successful,
   * the server will send a JOIN message as confirmation.
   */
  JOIN = 'JOIN',

  /**
   * When the user sends a PART message and if it is successful,
   * the server will send a PART message as confirmation.
   */
  PART = 'PART',

  /**
   * "( "=" / "*" / "@" ) `<channel>`
   *  :[ "@" / "+" ] `<nick>` *( " " [ "@" / "+" ] `<nick>` )"
   *
   * "@" is used for secret channels,
   * "*" for private channels,
   * and "=" for others (public channels).
   */
  RPL_NAMREPLY = '353',

  /**
   * "`<channel>` :End of NAMES list"
   */
  RPL_ENDOFNAMES = '366',

  /**
   * When the user sends a NICK request,
   * the server responds back with a NICK response.
   */
  NICK = 'NICK',

  /**
   *  ":No nickname given"
   */
  ERR_NONICKNAMEGIVEN = '431',
  /**
   * "`<nick>` :Erroneous nickname"
   */
  ERR_ERRONEUSNICKNAME = '432',

  /**
   * "`<nick>` :Nickname is already in use"
   */
  ERR_NICKNAMEINUSE = '433',

  /**
   * "`<nick>` :Nickname collision KILL from `<user>`@`<host>`"
   */
  ERR_NICKCOLLISION = '436'
}
