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
  Logger,
  Optional,
} from '@nestjs/common';
import axios from 'axios';
import { parse, stringify } from 'yaml';
import { resolve } from 'path';
import { MinecraftStack } from '../dto/minecraft-stack';

@Injectable()
export class PortainerService {
  private readonly logger = new Logger(PortainerService.name);

  private token: string | undefined = undefined;

  private baseUrl: string;
  private username: string;
  private password: string;

  constructor(
    @Optional() @Inject(Symbols.Axios) private readonly axiosLib: typeof axios,
    private readonly configService: ConfigService,
  ) {
    this.logger.debug('initializing service');
    if (!this.axiosLib) {
      this.logger.verbose('use Axios package');
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
    this.logger.verbose(`got configuration: base URL='${this.baseUrl}'`);
  }

  private getUrl(
    path: string,
    params: Record<string, string | number> = {},
  ): string {
    this.logger.debug(
      `constructing URL; path='${path}', params='${JSON.stringify(params)}'`,
    );
    const url = new URL(path, this.baseUrl);
    Object.keys(params).forEach((key) => {
      url.searchParams.append(key, `${params[key]}`);
    });
    const result = url.toString();
    this.logger.verbose(`calculated URL '${result}'`);
    return result;
  }

  public async getAuthToken(): Promise<string | undefined> {
    this.logger.debug('getting auth token');
    if (!this.token) {
      this.logger.verbose('logging in to API');
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
      this.logger.verbose('attempting status check for auth token');
      const response = await this.axiosLib({
        method: 'get',
        url: this.getUrl('/api/users'),
        headers: { Authorization: `Bearer ${this.token}` },
      });
      tokenIsValid = response.status === 200;
      if (!tokenIsValid) {
        this.logger.verbose('token is invalid; retrying');
        this.token = undefined;
        return this.getAuthToken();
      }
    } catch (err) {
      this.logger.warn('got HTTP error on auth token request');
      if (!/status code 401/i.test(err.message)) {
        this.logger.error(`HTTP error in getAuthToken: ${err.message}`, err);
        throw err;
      }
      this.logger.verbose('token is invalid; retrying');
      this.token = undefined;
      return this.getAuthToken();
    }
    this.logger.verbose('got auth token');
    return this.token;
  }

  // @TYPES remove this any
  public async getStackMetadata(stackId: number): Promise<any> {
    this.logger.debug(`getting stack metadata id='${stackId}'`);
    const token = await this.getAuthToken();
    const response = await this.axiosLib({
      method: 'get',
      url: this.getUrl(`/api/stacks/${stackId}/file`),
      headers: { Authorization: `Bearer ${token}` },
    });
    const metadata = parse(response.data.StackFileContent);
    this.logger.verbose('returning stack metadata');
    return metadata['x-metadata'];
  }

  // @TYPES remove this any
  public async listMinecraftStacks(): Promise<any[]> {
    this.logger.debug('getting minecraft stacks');
    const token = await this.getAuthToken();

    const response = await this.axiosLib({
      method: 'get',
      url: this.getUrl('/api/stacks'),
      headers: { Authorization: `Bearer ${token}` },
    });

    let result = response.data || [];

    this.logger.verbose('filtering non-minecraft stacks');
    result = result.filter((stack) =>
      (stack.Env || []).find((env) => env.name === 'PORTAINER_MINECRAFT_STACK'),
    );

    this.logger.verbose('extracting relevant details');
    result = result.map((stack) => ({
      id: stack.Id,
      stackName: stack.Name,
      status: stack.Status,
    }));

    this.logger.verbose('querying for stack metadata');
    result = await Promise.all(
      result.map(async (stack) => {
        return {
          ...stack,
          ...(await this.getStackMetadata(stack.id)),
        };
      }),
    );

    this.logger.verbose('returning list');
    return result;
  }

  public async startStack(stackId: number): Promise<void> {
    this.logger.debug(`starting stack id='${stackId}'`);
    const token = await this.getAuthToken();
    this.logger.verbose('making request to start stack');
    await this.axiosLib({
      method: 'post',
      url: this.getUrl(`/api/stacks/${stackId}/start`),
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  public async stopStack(stackId: number): Promise<void> {
    this.logger.debug(`stopping stack id='${stackId}'`);
    const token = await this.getAuthToken();
    this.logger.verbose('making request to stop stack');
    await this.axiosLib({
      method: 'post',
      url: this.getUrl(`/api/stacks/${stackId}/stop`),
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  public async getEndpointId(): Promise<number> {
    this.logger.debug('getting Portainer endpoint ID');
    const token = await this.getAuthToken();
    this.logger.verbose(`making request to get endpoint`);
    const response = await this.axiosLib({
      method: 'get',
      url: this.getUrl('/api/endpoints'),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const result = response.data[0].Id;
    this.logger.verbose(`got endpoint ID '${result}'`);
    return result;
  }

  public async createVolume(name: string, dirName: string): Promise<void> {
    this.logger.debug(`creating volume name='${name}', dir='${dirName}'`);
    const token = await this.getAuthToken();
    this.logger.verbose('getting endpoint ID');
    const endpointId = await this.getEndpointId();
    this.logger.verbose('making request to create volume');
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
    this.logger.debug(`creating stack name='${metadata.name}'`);
    const token = await this.getAuthToken();
    this.logger.verbose('getting endpoint ID');
    const endpointId = await this.getEndpointId();

    // get minecraft stacks & stop any running ones
    this.logger.verbose('getting list of stacks');
    const stacks = await this.listMinecraftStacks();
    this.logger.verbose('stopping any running stacks');
    await Promise.all(
      stacks.map((stack) =>
        stack.status === PortainerStatus.active
          ? this.stopStack(stack.id)
          : null,
      ),
    );

    if (!metadata.name) {
      this.logger.error('no name provided, throwing BAD REQUEST error');
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

    this.logger.verbose('building stack content');
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

    this.logger.verbose('making request to start stack');
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
