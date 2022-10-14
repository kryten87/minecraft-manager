import { ConfigService } from '@nestjs/config';
import {
  createStackName,
  EnvironmentVariables,
  MinecraftStackMetadata,
  objectToEnvValues,
  PortainerStackType,
  PortainerStatus,
  Symbols,
  defaultMinecraftConfig,
} from '@minecraft-manager/shared';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Optional,
} from '@nestjs/common';
import axios from 'axios';
import { parse, stringify } from 'yaml';
import { resolve } from 'path';
import { MinecraftStack } from '../dto/minecraft-stack';

@Injectable()
export class PortainerService {
  private token: string | undefined = undefined;

  private baseUrl: string;
  private username: string;
  private password: string;

  constructor(
    @Optional() @Inject(Symbols.Axios) private readonly axiosLib: typeof axios,
    private readonly configService: ConfigService,
  ) {
    if (!this.axiosLib) {
      this.axiosLib = axios;
    }

    this.baseUrl = this.configService.get<string>(
      EnvironmentVariables.PORTAINER_URL,
    );
    this.username = this.configService.get<string>(
      EnvironmentVariables.PORTAINER_USER,
    );
    this.password = this.configService.get<string>(
      EnvironmentVariables.PORTAINER_PASSWORD,
    );
  }

  private getUrl(
    path: string,
    params: Record<string, string | number> = {},
  ): string {
    const url = new URL(path, this.baseUrl);
    Object.keys(params).forEach((key) => {
      url.searchParams.append(key, `${params[key]}`);
    });
    return url.toString();
  }

  public async getAuthToken(): Promise<string | undefined> {
    if (!this.token) {
      const response = await this.axiosLib({
        method: 'post',
        url: this.getUrl('/api/auth'),
        data: { username: this.username, password: this.password },
      });
      this.token = response?.data?.jwt;
      return this.token;
    }

    let tokenIsValid = false;
    try {
      // @TODO rewrite this as a retry on auth failure approach
      const response = await this.axiosLib({
        method: 'get',
        url: this.getUrl('/api/status'),
        headers: { Authorization: `Bearer ${this.token}` },
      });
      tokenIsValid = response.status === 200;
      if (!tokenIsValid) {
        this.token = response?.data?.jwt;
      }
    } catch (err) {
      if (!/status code 401/i.test(err.message)) {
        throw err;
      }
      this.token = undefined;
      return this.getAuthToken();
    }
    return this.token;
  }

  // @TYPES remove this any
  public async getStackMetadata(stackId: number): Promise<any> {
    const token = await this.getAuthToken();
    const response = await this.axiosLib({
      method: 'get',
      url: this.getUrl(`/api/stacks/${stackId}/file`),
      headers: { Authorization: `Bearer ${token}` },
    });
    const metadata = parse(response.data.StackFileContent);
    return metadata['x-metadata'];
  }

  // @TYPES remove this any
  public async listMinecraftStacks(): Promise<any[]> {
    const token = await this.getAuthToken();

    const response = await this.axiosLib({
      method: 'get',
      url: this.getUrl('/api/stacks'),
      headers: { Authorization: `Bearer ${token}` },
    });

    let result = response.data || [];

    result = result.filter((stack) =>
      (stack.Env || []).find((env) => env.name === 'PORTAINER_MINECRAFT_STACK'),
    );

    result = result.map((stack) => ({
      id: stack.Id,
      stackName: stack.Name,
      status: stack.Status,
    }));

    result = await Promise.all(
      result.map(async (stack) => {
        return {
          ...stack,
          ...(await this.getStackMetadata(stack.id)),
        };
      }),
    );

    return result;
  }

  public async startStack(stackId: number): Promise<void> {
    const token = await this.getAuthToken();
    await this.axiosLib({
      method: 'post',
      url: this.getUrl(`/api/stacks/${stackId}/start`),
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  public async stopStack(stackId: number): Promise<void> {
    const token = await this.getAuthToken();
    await this.axiosLib({
      method: 'post',
      url: this.getUrl(`/api/stacks/${stackId}/stop`),
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  public async getEndpointId(): Promise<number> {
    const token = await this.getAuthToken();
    const response = await this.axiosLib({
      method: 'get',
      url: this.getUrl('/api/endpoints'),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data[0].Id;
  }

  public async createVolume(name: string, dirName: string): Promise<void> {
    const token = await this.getAuthToken();
    const endpointId = await this.getEndpointId();
    await this.axiosLib({
      method: 'post',
      url: this.getUrl(`/api/endpoints/${endpointId}/docker/volumes/create`),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        Name: name,
        Driver: 'local',
        DriverOpts: {
          type: 'none',
          o: 'bind',
          device: resolve(
            this.configService.get<string>(
              EnvironmentVariables.PORTAINER_VOLUME_PATH,
            ),
            dirName,
          ),
        },
      }),
    });
  }

  public async createStack(
    stackConfiguration: Partial<MinecraftStack>,
    metadata: Partial<MinecraftStackMetadata>,
  ): Promise<void> {
    const token = await this.getAuthToken();
    const endpointId = await this.getEndpointId();

    // get minecraft stacks & stop any running ones
    const stacks = await this.listMinecraftStacks();
    await Promise.all(
      stacks.map((stack) =>
        stack.status === PortainerStatus.active
          ? this.stopStack(stack.id)
          : null,
      ),
    );

    if (!metadata.name) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'The stack name must be provided',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const name = metadata.name;
    const safeName = createStackName(metadata.name);
    const path = resolve(
      this.configService.get<string>(
        EnvironmentVariables.PORTAINER_VOLUME_PATH,
      ),
      safeName,
    );

    const stackFileContent = {
      version: '3',
      'x-metadata': {
        name,
        description: metadata.description || '',
        owner: metadata.owner || '',
      },
      services: {
        server: {
          image: 'itzg/minecraft-server:latest',
          environment: {
            ...objectToEnvValues(defaultMinecraftConfig),
            ...objectToEnvValues(stackConfiguration),
            EULA: true,
          },
          ports: ['25565:25565'],
          volumes: ['/etc/localtime:/etc/localtime:ro', `${path}:/data`],
        },
      },
    };

    const content = stringify(stackFileContent);

    const body = {
      name: safeName,
      env: [{ name: 'PORTAINER_MINECRAFT_STACK', value: '1' }], // a flag to indicate this is a minecraft stack
      stackFileContent: content,
    };

    const url = this.getUrl(`/api/stacks`, {
      type: PortainerStackType.compose,
      method: 'string',
      endpointId,
    });

    await this.axiosLib({
      method: 'post',
      url,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(body),
    });
  }
}
