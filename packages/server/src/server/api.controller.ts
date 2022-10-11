import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PortainerService } from './services/portainer.service';
import { MinecraftStack } from './dto/minecraft-stack';
import { MinecraftStackMetadata } from './app.types';

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
  public async create(
    @Body() config: Partial<MinecraftStack & MinecraftStackMetadata>,
  ): Promise<any> {
    const metadata = {
      name: config.name || undefined,
      description: config.description || undefined,
      owner: config.owner || undefined,
    };
    const revisedConfig = { ...config };
    delete revisedConfig.name;
    delete revisedConfig.description;
    delete revisedConfig.owner;

    await this.portainerService.createStack(revisedConfig, metadata);
    return { status: 'ok' };
  }
}
