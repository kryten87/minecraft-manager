import { Test, TestingModule } from '@nestjs/testing';
import { PortainerService } from './portainer.service';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables, PortainerStatus, Symbols } from '../app.types';

describe('PortainerService', () => {
  let service: PortainerService;

  const baseUrl = 'http://example.com';
  const username = 'myUser';
  const password = 'myPassword';
  const expiredToken = `expired-${Date.now()}`;
  const token = `live-${Date.now()}`;

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
    beforeAll(() => {
      mockAxios.mockResolvedValue({
        status: 200,
        data: { token },
      });
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

    it('should return the expected value', async () => {
      await service.getAuthToken();
      expect(service.token).toBe(token);
    });
  });

  describe('listMinecraftStacks', () => {
    describe('state = currently not authenticated', () => {
      let originalFunction;

      beforeEach(() => {
        service.token = token;
        originalFunction = service.getAuthToken;
        service.getAuthToken = jest.fn(() => {
          service.token = token;
          return Promise.resolve();
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

    describe('state = currently authenticated', () => {
      let originalFunction;

      beforeEach(() => {
        service.token = token;
        originalFunction = service.getAuthToken;
        service.getAuthToken = jest.fn();
        service.token = token;

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
              Id: 42,
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

      it('should not authenticate', async () => {
        await service.listMinecraftStacks();

        expect(service.getAuthToken).not.toBeCalled();
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
          { id: 42, name: 'minecraft-test', status: PortainerStatus.inactive },
        ]);
      });
    });

    describe('state = expired token', () => {
      let originalFunction;

      beforeEach(() => {
        service.token = token;
        originalFunction = service.getAuthToken;
        service.getAuthToken = jest.fn(() => {
          service.token = token;
          return Promise.resolve();
        });
        service.token = expiredToken;

        // first call -- fails with 401 Unauthorized
        mockAxios.mockResolvedValueOnce({
          status: 401,
        });
        mockAxios.mockResolvedValueOnce({
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
              Id: 4242,
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

      it('should make the correct request twice', async () => {
        await service.listMinecraftStacks();

        expect(mockAxios).toBeCalledTimes(2);
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
          {
            id: 4242,
            name: 'minecraft-test',
            status: PortainerStatus.inactive,
          },
        ]);
      });
    });
  });
});
