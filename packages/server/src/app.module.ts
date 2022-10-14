import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { PortainerService } from './services/portainer.service';
import { ApiController } from './api.controller';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [ApiController],
  providers: [ConfigService, PortainerService],
})
export class AppModule {}
