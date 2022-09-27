import { Test, TestingModule } from '@nestjs/testing';
import { PortainerService } from './portainer.service';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables, Symbols } from '../app.types';

describe('PortainerService', () => {
  let service: PortainerService;

  const host = 'http://example.com';
  const username = 'myUser';
  const password = 'myPassword';
  const token = `${Date.now()}`;

  const mockConfigService = {
    get: (key: EnvironmentVariables): string => {
      switch (key) {
        case EnvironmentVariables.PORTAINER_URL:
          return host;
        case EnvironmentVariables.PORTAINER_USER:
          return username;
        case EnvironmentVariables.PORTAINER_PASSWORD:
          return password;
        default:
          throw new Error(`unrecognized config key ${key}`);
      }
    },
  };

  const mockAxios = jest.fn().mockResolvedValue({ data: { token } });

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
    it('should make the correct request for an auth token', async () => {
      await service.getAuthToken(host, username, password);

      expect(mockAxios).toBeCalledTimes(1);
      expect(mockAxios).toBeCalledWith({
        method: 'post',
        url: `${host}/api/auth`,
        data: {
          username,
          password,
        },
      });
    });

    it('should return the expected value', async () => {
      const result = await service.getAuthToken(host, username, password);

      expect(result).toBe(token);
    });
  });
});
