interface JoinCommand {
  channel: string;
  key?: string;
}

interface PartCommandProps {
  channels: string[];
  partMessage?: string;
}

interface IRCClientInterface {
  host: string;
  port: number;
  nickName: string;
  realName: string;
  connected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  join(channels: JoinCommand[]): Promise<unknown>;
  part(props: PartCommandProps): Promise<unknown>;
  getChannelDetails(channel: string): IChannelDetails | undefined;
}

interface IChannelDetails {
  channel: string;
  topic: string | null;
  names: Set<string>;
}

export { JoinCommand, PartCommandProps, IRCClientInterface, IChannelDetails };
