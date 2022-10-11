import { Controller, Get, Param, Post } from '@nestjs/common';
import { PortainerService } from './services/portainer.service';

@Controller('api')
export class ApiController {
  constructor(private readonly portainerService: PortainerService) {}

  @Get('list')
  // @TYPES remove any
  public async list(): Promise<any> {
    return this.portainerService.listMinecraftStacks();
  }

  @Get('start/:id')
  // @TYPES remove any
  public async start(@Param('id') id: number): Promise<any> {
    await this.portainerService.startStack(id);
    return { status: 'ok' };
  }

  @Get('stop/:id')
  // @TYPES remove any
  public async stop(@Param('id') id: number): Promise<any> {
    await this.portainerService.stopStack(id);
    return { status: 'ok' };
  }

  @Post('create')
  public async create(): Promise<any> {
    return { status: 'ok' };
  }
}
