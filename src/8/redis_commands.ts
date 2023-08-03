/**
 * Supported commands by the Redis Server
 *
 * @enum {number}
 */
enum RedisCommands {
  PING = 'PING',
  ECHO = 'ECHO',
  SET = 'SET',
  GET = 'GET',
  DEL = 'DEL'
}

export { RedisCommands };
