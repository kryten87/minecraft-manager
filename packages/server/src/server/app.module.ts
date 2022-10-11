import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { PortainerService } from './services/portainer.service';
import { RenderModule } from 'nest-next';
import { ApiController } from './api.controller';
import Next from 'next';

@Module({
  imports: [RenderModule.forRootAsync(Next({ dev: true }), { viewsDir: null })],
  controllers: [AppController, ApiController],
  providers: [AppService, ConfigService, PortainerService],
})
export class AppModule {}
