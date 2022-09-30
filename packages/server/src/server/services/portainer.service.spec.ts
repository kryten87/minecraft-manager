import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables, PortainerStatus, Symbols } from '../app.types';
import { PortainerService } from './portainer.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('PortainerService', () => {
  let service: PortainerService;

  const baseUrl = 'http://example.com';
  const username = 'myUser';
  const password = 'myPassword';
  const token = `tok_${Date.now()}`;

  const mockConfigService = {
    get: (key: EnvironmentVariables): string => {
      switch (key) {
        case EnvironmentVariables.PORTAINER_URL:
          return baseUrl;
        case EnvironmentVariables.PORTAINER_USER:
          return username;
        case EnvironmentVariables.PORTAINER_PASSWORD:
          return password;
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
          url: `${baseUrl}/api/motd`,
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
          url: `${baseUrl}/api/motd`,
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
});
