import { Test, TestingModule } from '@nestjs/testing';
import { PortainerService } from './portainer.service';

describe('PortainerService', () => {
  let service: PortainerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PortainerService],
    }).compile();

    service = module.get<PortainerService>(PortainerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
