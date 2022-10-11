import { Test, TestingModule } from '@nestjs/testing';
import { ApiController } from './api.controller';

describe('ApiController', () => {
  let controller: ApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiController],
    }).compile();

    controller = module.get<ApiController>(ApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('list', () => {
    it.todo('should call the portainer service list method');

    it.todo('should return the expected values');
  });

  describe('start', () => {
    it.todo('should call the portainer service start method with the id');
  });

  describe('stop', () => {
    it.todo('should call the portainer service stop method with the id');
  });

  describe('create', () => {
    it.todo(
      'should call the portainer service create method with the parameters',
    );
  });
});
