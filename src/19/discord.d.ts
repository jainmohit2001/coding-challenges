import { Collection } from 'discord.js';

declare module 'discord.js' {
  export interface Client {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    commands: Collection<any, any>;
  }
}
