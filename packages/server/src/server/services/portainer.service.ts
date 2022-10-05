import { ConfigService } from '@nestjs/config';
import {
  defaultMinecraftConfig,
  EnvironmentVariables,
  MinecraftStackConfig,
  MinecraftStackMetadata,
  PortainerStackType,
  Symbols,
} from '../app.types';
import { Inject, Injectable, Optional } from '@nestjs/common';
import axios from 'axios';
import { stringify } from 'yaml';

@Injectable()
export class PortainerService {
  // @TODO make this private
  public token: string | undefined = undefined;

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

  public async listMinecraftStacks(): Promise<any[]> {
    const token = await this.getAuthToken();

    const response = await this.axiosLib({
      method: 'get',
      url: this.getUrl('/api/stacks'),
      headers: { Authorization: `Bearer ${token}` },
    });

    // @TODO get additional information for the stacks
    return (response.data || [])
      .filter(
        (stack) =>
          /minecraft/i.test(stack.Name) ||
          (stack.Env || []).find(
            (env) => env.name === 'PORTAINER_MINECRAFT_STACK',
          ),
      )
      .map((stack) => ({
        id: stack.Id,
        name: stack.Name,
        status: stack.Status,
      }));
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

  // @TODO move to utility functions
  private camelCaseToSnakeCase(str: string): string {
    return str
      .split(/\.?(?=[A-Z])/)
      .join('_')
      .toLowerCase();
  }

  // @TODO move to utility functions
  private objectToEnvValues(obj: Record<string, any>): Record<string, any> {
    const res = {};
    Object.keys(obj).forEach((key) => {
      res[this.camelCaseToSnakeCase(key).toUpperCase()] = obj[key];
    });
    return res;
  }

  public async createStack(
    stackConfiguration: Partial<MinecraftStackConfig>,
    metadata: Partial<MinecraftStackMetadata>,
  ): Promise<void> {
    const stackFileContent = {
      version: '3',
      'x-metadata': {
        description: metadata.description || 'my silly server', // @TODO from request
        owner: metadata.owner || 'Evan', // @TODO from request
      },
      services: {
        server: {
          image: 'itzg/minecraft-server:latest',
          environment: {
            ...this.objectToEnvValues(defaultMinecraftConfig),
            ...this.objectToEnvValues(stackConfiguration),
            EULA: true,
          },
          ports: ['25565:25565'],
          volumes: ['/etc/localtime:/etc/localtime:ro', 'mcdata:/data'],
        },
      },
      volumes: {
        mcdata: {
          driver: 'local',
          driver_opts: {
            type: 'none',
            o: 'bind',
            device: `/home/dave/minecraft/mc-${
              metadata.serverId || Date.now()
            }`,
          },
        },
      },
    };

    const content = stringify(stackFileContent);

    const body = {
      name: 'minecraft-test-api', // @TODO get this from config
      stackFileContent: content, // @TODO generate this from config via YAML
    };

    const token = await this.getAuthToken();

    const endpointId = await this.getEndpointId();

    const url = this.getUrl(`/api/stacks`, {
      type: PortainerStackType.compose,
      method: 'string',
      endpointId,
    });

    const res = await this.axiosLib({
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
