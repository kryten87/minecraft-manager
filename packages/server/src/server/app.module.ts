import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RenderModule } from 'nest-next';
import { PortainerService } from './services/portainer.service';
import Next from 'next';

@Module({
  imports: [RenderModule.forRootAsync(Next({ dev: true }), { viewsDir: null })],
  controllers: [AppController],
  providers: [AppService, PortainerService],
})
export class AppModule {}
