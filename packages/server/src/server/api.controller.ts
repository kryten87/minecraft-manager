import { Controller, Get, Post } from '@nestjs/common';
import { PortainerService } from './services/portainer.service';

@Controller('api')
export class ApiController {
  constructor(private readonly portainerService: PortainerService) {}

  @Get('list')
  // @TYPES remove any
  public async list(): Promise<any> {
    return this.portainerService.listMinecraftStacks();
  }

  @Get('start')
  // @TYPES remove any
  public async start(): Promise<any> {
    return '';
  }

  @Get('stop')
  // @TYPES remove any
  public async stop(): Promise<any> {
    return '';
  }

  @Post('create')
  public async create(): Promise<any> {
    return '';
  }
}
