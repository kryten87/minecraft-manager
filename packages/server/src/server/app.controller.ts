import { Controller, Get, Render } from '@nestjs/common';
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
    // console.log('.... create');
    // await this.portainerService.createStack({}, { name: `mc-test-10-01` });
    // console.log('.... create finished');
    return {
      containers: await this.portainerService.listMinecraftStacks(),
    };
  }
}
