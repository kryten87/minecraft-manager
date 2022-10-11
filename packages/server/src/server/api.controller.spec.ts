import { Test, TestingModule } from '@nestjs/testing';
import { ApiController } from './api.controller';
import { PortainerService } from './services/portainer.service';

describe('ApiController', () => {
  let controller: ApiController;

  const stacks = [
    {
      id: 30,
      stackName: 'mc-another-test',
      status: 1,
      name: 'mc-another-test',
      description: 'my silly server',
      owner: 'Evan',
    },
    {
      id: 31,
      stackName: 'mc-big-hairy-server',
      status: 2,
      name: 'mc-big-hairy-server',
      description: 'another server',
      owner: 'Maxwell',
    },
  ];

  const mockPortainerService = {
    listMinecraftStacks: jest.fn().mockResolvedValue(stacks),
    startStack: jest.fn(),
    stopStack: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiController],
      providers: [
        { provide: PortainerService, useValue: mockPortainerService },
      ],
    }).compile();

    controller = module.get<ApiController>(ApiController);

    mockPortainerService.listMinecraftStacks.mockClear();
    mockPortainerService.startStack.mockClear();
    mockPortainerService.stopStack.mockClear();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('list', () => {
    it('should call the portainer service list method', async () => {
      await controller.list();
      expect(mockPortainerService.listMinecraftStacks).toBeCalledTimes(1);
    });

    it('should return the expected values', async () => {
      const res = await controller.list();
      expect(res).toEqual(stacks);
    });
  });

  describe('start', () => {
    it('should call the portainer service start method with the id', async () => {
      const id = 42;

      await controller.start(id);

      expect(mockPortainerService.startStack).toBeCalledTimes(1);
      expect(mockPortainerService.startStack).toBeCalledWith(id);
    });
  });

  describe('stop', () => {
    it('should call the portainer service stop method with the id', async () => {
      const id = 43;

      await controller.stop(id);

      expect(mockPortainerService.stopStack).toBeCalledTimes(1);
      expect(mockPortainerService.stopStack).toBeCalledWith(id);
    });
  });

  describe('create', () => {
    it.todo(
      'should call the portainer service create method with the parameters',
    );
  });
});
