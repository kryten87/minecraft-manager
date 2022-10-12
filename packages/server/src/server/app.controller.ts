import { Controller, Get, Render, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { PortainerService } from './services/portainer.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly portainerService: PortainerService,
  ) {}

  @Get()
  @Render('index')
  async home() {
    return {
      containers: await this.portainerService.listMinecraftStacks(),
    };
  }

  @Get('/create')
  @Render('create')
  async create() {
    return {};
  }

  @Get('start')
  async start(@Query('name') name: string): Promise<string> {
    if (!name) {
      throw new Error('must provide a name');
    }
    console.log('...create stack', name);
    await this.portainerService.createStack({}, { name });
    console.log('...create finished');
    return 'stack started';
  }
}
