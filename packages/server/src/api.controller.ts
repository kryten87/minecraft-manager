import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { PortainerService } from './services/portainer.service';
import { MinecraftStack } from './dto/minecraft-stack';
import { MinecraftStackMetadata } from '@minecraft-manager/shared';

@Controller('api')
export class ApiController {
  private readonly logger = new Logger(ApiController.name);

  constructor(private readonly portainerService: PortainerService) {}

  @Get('list')
  // @TYPES remove any
  public async list(): Promise<any> {
    this.logger.debug('GET /api/list');
    return this.portainerService.listMinecraftStacks();
  }

  @Get('start/:id')
  // @TYPES remove any
  public async start(@Param('id') id: number): Promise<any> {
    this.logger.debug(`GET /api/start/${id}`);
    await this.portainerService.startStack(id);
    return { status: 'ok' };
  }

  @Get('stop/:id')
  // @TYPES remove any
  public async stop(@Param('id') id: number): Promise<any> {
    this.logger.debug(`GET /api/stop/${id}`);
    await this.portainerService.stopStack(id);
    return { status: 'ok' };
  }

  @Post('create')
  public async create(
    @Body() config: Partial<MinecraftStack & MinecraftStackMetadata>,
  ): Promise<any> {
    this.logger.debug('POST /api/create');
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
