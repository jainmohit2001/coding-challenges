import { RedisSerializer } from './redis_serializer';
import { RedisCommands } from './redis_commands';
import axios from 'axios';
import { RedisDeserializer } from './redis_deserializer';

interface IRedisClient {
  host: string;
  port: number;
  ping(message?: string): void;
  set(key: string, value: string): void;
  echo(message: string): void;
  get(key: string): Promise<string>;
}

export class RedisClient implements IRedisClient {
  host;
  port;
  private url: string;

  constructor(host: string = '127.0.0.1', port: number = 6379) {
    this.host = host;
    this.port = port;
    this.url = 'http://' + host + ':' + port + '/';

    const serializer = new RedisSerializer();

    axios.defaults.headers.post['Content-Type'] = 'text/plain';

    axios.interceptors.request.use(function (config) {
      config.data = serializer.serialize(config.data);
      return config;
    });

    axios.interceptors.response.use(function (config) {
      config.data = new RedisDeserializer(config.data).parse();
      if (config.data instanceof Error) {
        config.data = config.data.message;
      }
      return config;
    });
  }

  async ping(message?: string) {
    const data: string[] = [RedisCommands.PING];
    if (message !== undefined) {
      data.push(message);
    }
    const response = await axios.post(this.url, data);
    console.log(response.data);
  }

  async set(key: string, value: string) {
    const data: string[] = [RedisCommands.SET, key, value];

    const response = await axios.post(this.url, data);
    console.log(response.data);
  }

  async echo(message: string) {
    const data: string[] = [RedisCommands.ECHO, message];

    const response = await axios.post(this.url, data);
    console.log(response.data);
  }

  async get(key: string): Promise<string> {
    const data: string[] = [RedisCommands.GET, key];

    const response = await axios.post(this.url, data);
    console.log(response.data);
    return response.data;
  }
}
