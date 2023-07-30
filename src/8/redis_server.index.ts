import { RedisServer } from './redis_server';

const redisServer = new RedisServer(6379, true);

redisServer.startServer();
