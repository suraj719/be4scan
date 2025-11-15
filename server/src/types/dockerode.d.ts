declare module "dockerode" {
  export interface ContainerWaitResponse {
    StatusCode?: number;
    Error?: string;
  }

  export interface ContainerConfig {
    Image: string;
    Cmd?: string[];
    HostConfig?: {
      Binds?: string[];
      AutoRemove?: boolean;
      Memory?: number;
      MemorySwap?: number;
      CpuQuota?: number;
      CpuPeriod?: number;
    };
  }

  export interface Container {
    id: string;
    start(): Promise<void>;
    stop(options?: { t?: number }): Promise<void>;
    remove(): Promise<void>;
    wait(
      callback: (err: Error | null, data: ContainerWaitResponse | null) => void
    ): void;
    logs(options: {
      follow?: boolean;
      stdout?: boolean;
      stderr?: boolean;
    }): NodeJS.ReadableStream;
  }

  export interface Image {
    inspect(): Promise<any>;
  }

  export interface Modem {
    followProgress(
      stream: NodeJS.ReadableStream,
      onFinished: (err: Error | null) => void,
      onProgress?: (event: { status?: string; progress?: string }) => void
    ): void;
  }

  export default class Docker {
    constructor(options?: { socketPath?: string });
    createContainer(config: ContainerConfig): Promise<Container>;
    getImage(name: string): Image;
    pull(
      image: string,
      callback: (
        err: Error | null,
        stream: NodeJS.ReadableStream | null
      ) => void
    ): void;
    modem: Modem;
  }
}
