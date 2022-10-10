import { ConfigService } from '@nestjs/config';
import {
  EnvironmentVariables,
  PortainerStackType,
  PortainerStatus,
  Symbols,
} from '../app.types';
import { PortainerService } from './portainer.service';
import { Test, TestingModule } from '@nestjs/testing';
import { stringify } from 'yaml';
import { resolve } from 'path';

describe('PortainerService', () => {
  let service: PortainerService;

  const baseUrl = 'http://example.com';
  const username = 'myUser';
  const password = 'myPassword';
  const token = `tok_${Date.now()}`;
  const volumePath = '/some/path';

  const mockConfigService = {
    get: (key: EnvironmentVariables): string => {
      switch (key) {
        case EnvironmentVariables.PORTAINER_URL:
          return baseUrl;
        case EnvironmentVariables.PORTAINER_USER:
          return username;
        case EnvironmentVariables.PORTAINER_PASSWORD:
          return password;
        case EnvironmentVariables.PORTAINER_VOLUME_PATH:
          return volumePath;
        default:
          throw new Error(`unrecognized config key ${key}`);
      }
    },
  };

  const mockAxios = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortainerService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: Symbols.Axios, useValue: mockAxios },
      ],
    }).compile();

    service = module.get<PortainerService>(PortainerService);

    mockAxios.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAuthToken', () => {
    describe('state = no token', () => {
      beforeEach(() => {
        mockAxios.mockResolvedValue({
          status: 200,
          data: { jwt: token },
        });
      });

      afterEach(() => {
        mockAxios.mockClear();
      });

      it('should make the correct request for an auth token', async () => {
        await service.getAuthToken();

        expect(mockAxios).toBeCalledTimes(1);
        expect(mockAxios).toBeCalledWith({
          method: 'post',
          url: `${baseUrl}/api/auth`,
          data: {
            username,
            password,
          },
        });
      });

      it('should set the token value', async () => {
        const result = await service.getAuthToken();
        expect(result).toBe(token);
      });
    });

    describe('state = valid token', () => {
      beforeEach(() => {
        mockAxios.mockResolvedValueOnce({ status: 200, data: {} });
      });

      afterEach(() => {
        mockAxios.mockClear();
      });

      it('should check the token & should not request a new one', async () => {
        service.token = token;

        await service.getAuthToken();

        expect(mockAxios).toBeCalledTimes(1);
        expect(mockAxios).toBeCalledWith({
          method: 'get',
          url: `${baseUrl}/api/status`,
          headers: { Authorization: `Bearer ${token}` },
        });
      });

      it('should not change the token value', async () => {
        service.token = token;

        const result = await service.getAuthToken();

        expect(result).toBe(token);
      });
    });

    describe('state = expired token', () => {
      const newToken = `tok_${Math.random()}`;
      beforeEach(() => {
        mockAxios.mockRejectedValueOnce(new Error('status code 401'));
        mockAxios.mockResolvedValueOnce({
          status: 200,
          data: { jwt: newToken },
        });
      });

      afterEach(() => {
        mockAxios.mockClear();
      });

      it('should check the token, request a new token, and update the token value', async () => {
        service.token = token;

        const result = await service.getAuthToken();

        expect(mockAxios).toBeCalledTimes(2);
        expect(mockAxios).toBeCalledWith({
          method: 'get',
          url: `${baseUrl}/api/status`,
          headers: { Authorization: `Bearer ${token}` },
        });
        expect(mockAxios).toBeCalledWith({
          method: 'post',
          url: `${baseUrl}/api/auth`,
          data: {
            username,
            password,
          },
        });
        expect(result).toBe(newToken);
      });
    });
  });

  describe('listMinecraftStacks', () => {
    let originalFunction;

    beforeEach(() => {
      service.token = token;
      originalFunction = service.getAuthToken;
      service.getAuthToken = jest.fn(() => {
        service.token = token;
        return Promise.resolve(service.token);
      });
      service.token = undefined;

      mockAxios.mockResolvedValue({
        status: 200,
        data: [
          {
            Id: 2,
            Name: 'nginx-proxy',
            Type: 2,
            EndpointId: 2,
            SwarmId: '',
            EntryPoint: 'docker-compose.yml',
            Env: [],
            ResourceControl: {
              Id: 1,
              ResourceId: '2_nginx-proxy',
              SubResourceIds: [],
              Type: 6,
              UserAccesses: [],
              TeamAccesses: [],
              Public: false,
              AdministratorsOnly: true,
              System: false,
            },
            Status: 1,
            ProjectPath: '/data/compose/2',
            CreationDate: 1664053927,
            CreatedBy: 'dave',
            UpdateDate: 0,
            UpdatedBy: '',
            AdditionalFiles: null,
            AutoUpdate: null,
            Option: null,
            GitConfig: null,
            FromAppTemplate: false,
            Namespace: '',
            IsComposeFormat: false,
          },
          {
            Id: 3,
            Name: 'recipes',
            Type: 2,
            EndpointId: 2,
            SwarmId: '',
            EntryPoint: 'docker-compose.yml',
            Env: [],
            ResourceControl: {
              Id: 2,
              ResourceId: '2_recipes',
              SubResourceIds: [],
              Type: 6,
              UserAccesses: [],
              TeamAccesses: [],
              Public: false,
              AdministratorsOnly: true,
              System: false,
            },
            Status: 1,
            ProjectPath: '/data/compose/3',
            CreationDate: 1664054753,
            CreatedBy: 'dave',
            UpdateDate: 0,
            UpdatedBy: '',
            AdditionalFiles: null,
            AutoUpdate: null,
            Option: null,
            GitConfig: null,
            FromAppTemplate: false,
            Namespace: '',
            IsComposeFormat: false,
          },
          {
            Id: 4,
            Name: 'minecraft-test',
            Type: 2,
            EndpointId: 2,
            SwarmId: '',
            EntryPoint: 'docker-compose.yml',
            Env: [],
            ResourceControl: {
              Id: 3,
              ResourceId: '2_minecraft-test',
              SubResourceIds: [],
              Type: 6,
              UserAccesses: [],
              TeamAccesses: [],
              Public: false,
              AdministratorsOnly: true,
              System: false,
            },
            Status: 2,
            ProjectPath: '/data/compose/4',
            CreationDate: 1664147265,
            CreatedBy: 'dave',
            UpdateDate: 0,
            UpdatedBy: '',
            AdditionalFiles: null,
            AutoUpdate: null,
            Option: null,
            GitConfig: null,
            FromAppTemplate: false,
            Namespace: '',
            IsComposeFormat: false,
          },
        ],
      });
    });

    afterEach(() => {
      service.getAuthToken = originalFunction;
    });

    it('should authenticate', async () => {
      await service.listMinecraftStacks();

      expect(service.getAuthToken).toBeCalledTimes(1);
    });

    it('should make the correct request', async () => {
      await service.listMinecraftStacks();

      expect(mockAxios).toBeCalledTimes(1);
      expect(mockAxios).toBeCalledWith({
        method: 'get',
        url: `${baseUrl}/api/stacks`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    });

    it('should return the expected values', async () => {
      const result = await service.listMinecraftStacks();
      expect(result).toEqual([
        { id: 4, name: 'minecraft-test', status: PortainerStatus.inactive },
      ]);
    });
  });

  describe('startStack', () => {
    let originalFunction;

    beforeEach(() => {
      service.token = token;
      originalFunction = service.getAuthToken;
      service.getAuthToken = jest.fn(() => {
        service.token = token;
        return Promise.resolve(service.token);
      });
      service.token = undefined;

      mockAxios.mockResolvedValue({});
    });

    afterEach(() => {
      service.getAuthToken = originalFunction;
    });

    it('should authenticate', async () => {
      const id = Math.floor(Math.random() * 1000 + 1);

      await service.startStack(id);

      expect(service.getAuthToken).toBeCalledTimes(1);
    });

    it('should make the correct request', async () => {
      const id = Math.floor(Math.random() * 1000 + 1);

      await service.startStack(id);

      expect(mockAxios).toBeCalledTimes(1);
      expect(mockAxios).toBeCalledWith({
        method: 'post',
        url: `${baseUrl}/api/stacks/${id}/start`,
        headers: { Authorization: `Bearer ${token}` },
      });
    });
  });

  describe('stopStack', () => {
    let originalFunction;

    beforeEach(() => {
      service.token = token;
      originalFunction = service.getAuthToken;
      service.getAuthToken = jest.fn(() => {
        service.token = token;
        return Promise.resolve(service.token);
      });
      service.token = undefined;

      mockAxios.mockResolvedValueOnce({});
    });

    afterEach(() => {
      service.getAuthToken = originalFunction;
    });

    it('should authenticate', async () => {
      const id = Math.floor(Math.random() * 1000 + 1);

      await service.stopStack(id);

      expect(service.getAuthToken).toBeCalledTimes(1);
    });

    it('should make the correct request', async () => {
      const id = Math.floor(Math.random() * 1000 + 1);

      await service.stopStack(id);

      expect(mockAxios).toBeCalledTimes(1);
      expect(mockAxios).toBeCalledWith({
        method: 'post',
        url: `${baseUrl}/api/stacks/${id}/stop`,
        headers: { Authorization: `Bearer ${token}` },
      });
    });
  });

  describe('createVolume', () => {
    let originalAuthFunction;
    let originalEndpointFunction;

    const endpointId = Math.floor(Math.random() * 1000 + 1);

    beforeEach(() => {
      service.token = token;
      originalAuthFunction = service.getAuthToken;
      service.getAuthToken = jest.fn(() => {
        service.token = token;
        return Promise.resolve(service.token);
      });
      service.token = undefined;

      originalEndpointFunction = service.getEndpointId;
      service.getEndpointId = jest.fn(() => {
        return Promise.resolve(endpointId);
      });

      mockAxios.mockResolvedValue({});
    });

    afterEach(() => {
      service.getAuthToken = originalAuthFunction;
      service.getEndpointId = originalEndpointFunction;
    });

    it('should authenticate', async () => {
      const name = 'my-volume';
      const path = '/my/fake/path';

      await service.createVolume(name, path);

      expect(service.getAuthToken).toBeCalledTimes(1);
    });

    it('should get the endpoint ID', async () => {
      const name = 'my-volume';
      const path = '/my/fake/path';

      await service.createVolume(name, path);

      expect(service.getEndpointId).toBeCalledTimes(1);
    });

    it('should make the correct request', async () => {
      const name = 'my-other-volume';
      const path = '/my/other/fake/path';

      await service.createVolume(name, path);

      expect(mockAxios).toBeCalledTimes(1);
      expect(mockAxios).toBeCalledWith({
        method: 'post',
        url: `${baseUrl}/api/endpoints/${endpointId}/docker/volumes/create`,
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
            device: resolve(volumePath, path),
          },
        }),
      });
    });
  });

  describe('createStack', () => {
    let originalFunction;
    const endpointId = Math.floor(Math.random() * 100 + 1);

    beforeEach(() => {
      service.token = token;
      originalFunction = service.getAuthToken;
      service.getAuthToken = jest.fn(() => {
        service.token = token;
        return Promise.resolve(service.token);
      });
      service.token = undefined;

      mockAxios.mockResolvedValueOnce({
        data: [{ Id: endpointId }],
      });
      mockAxios.mockResolvedValue({});
    });

    afterEach(() => {
      service.getAuthToken = originalFunction;
    });

    it('should authenticate', async () => {
      const id = Math.floor(Math.random() * 1000 + 1);

      await service.stopStack(id);

      expect(service.getAuthToken).toBeCalledTimes(1);
    });

    it.todo('should get all minecraft stacks and stop any running ones');

    it('should make the correct request (no args -> default values)', async () => {
      await service.createStack({}, { serverId: 42 });

      expect(mockAxios).toBeCalledTimes(2);
      expect(mockAxios).toBeCalledWith({
        method: 'get',
        url: `${baseUrl}/api/endpoints`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      expect(mockAxios).toBeCalledWith({
        method: 'post',
        url: `${baseUrl}/api/stacks?type=${PortainerStackType.compose}&method=string&endpointId=${endpointId}`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: JSON.stringify({
          name: 'minecraft-test-api',
          env: [{ name: 'PORTAINER_MINECRAFT_STACK', value: '1' }],
          stackFileContent: stringify({
            version: '3',
            'x-metadata': {
              description: 'my silly server',
              owner: 'Evan',
            },
            services: {
              server: {
                image: 'itzg/minecraft-server:latest',
                environment: {
                  WHITELIST: 'Kryten,MWThomas,EMThomas',
                  OPS: 'Kryten,MWThomas,EMThomas',
                  ICON: 'http://findicons.com/files/icons/2438/minecraft/256/minecraft.png',
                  ALLOW_NETHER: true,
                  ANNOUNCE_PLAYER_ACHIEVEMENTS: true,
                  ENABLE_COMMAND_BLOCK: true,
                  GENERATE_STRUCTURES: true,
                  HARDCODE: false,
                  SNOOPER_ENABLED: false,
                  MAX_BUILD_HEIGHT: 256,
                  MAX_TICK_TIME: 60000,
                  SPAWN_ANIMALS: true,
                  SPAWN_MONSTERS: true,
                  SPAWN_NPCS: true,
                  SPAWN_PROTECTION: 0,
                  VIEW_DISTANCE: 10,
                  GAME_MODE: 'survival',
                  PVP: false,
                  LEVEL_TYPE: 'minecraft:normal',
                  ONLINE_MODE: true,
                  ALLOW_FLIGHT: true,
                  DIFFICULTY: 2,
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
                  device: '/home/dave/minecraft/mc-42',
                },
              },
            },
          }),
        }),
      });
    });

    it('should make the correct request (some args provided)', async () => {
      await service.createStack(
        {
          icon: 'http://findicons.com/files/icons/2438/minecraft/256/minecraft.png',
          allowNether: false,
          maxBuildHeight: 1024,
          spawnAnimals: false,
          pvp: true,
        },
        {
          description: 'something weird',
          owner: 'Nobody',
          serverId: 99,
        },
      );

      expect(mockAxios).toBeCalledTimes(2);
      expect(mockAxios).toBeCalledWith({
        method: 'get',
        url: `${baseUrl}/api/endpoints`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      expect(mockAxios).toBeCalledWith({
        method: 'post',
        url: `${baseUrl}/api/stacks?type=${PortainerStackType.compose}&method=string&endpointId=${endpointId}`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: JSON.stringify({
          name: 'minecraft-test-api',
          env: [{ name: 'PORTAINER_MINECRAFT_STACK', value: '1' }],
          stackFileContent: stringify({
            version: '3',
            'x-metadata': {
              description: 'something weird',
              owner: 'Nobody',
            },
            services: {
              server: {
                image: 'itzg/minecraft-server:latest',
                environment: {
                  WHITELIST: 'Kryten,MWThomas,EMThomas',
                  OPS: 'Kryten,MWThomas,EMThomas',
                  ICON: 'http://findicons.com/files/icons/2438/minecraft/256/minecraft.png',
                  ALLOW_NETHER: false,
                  ANNOUNCE_PLAYER_ACHIEVEMENTS: true,
                  ENABLE_COMMAND_BLOCK: true,
                  GENERATE_STRUCTURES: true,
                  HARDCODE: false,
                  SNOOPER_ENABLED: false,
                  MAX_BUILD_HEIGHT: 1024,
                  MAX_TICK_TIME: 60000,
                  SPAWN_ANIMALS: false,
                  SPAWN_MONSTERS: true,
                  SPAWN_NPCS: true,
                  SPAWN_PROTECTION: 0,
                  VIEW_DISTANCE: 10,
                  GAME_MODE: 'survival',
                  PVP: true,
                  LEVEL_TYPE: 'minecraft:normal',
                  ONLINE_MODE: true,
                  ALLOW_FLIGHT: true,
                  DIFFICULTY: 2,
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
                  device: '/home/dave/minecraft/mc-99',
                },
              },
            },
          }),
        }),
      });
    });
  });
});
