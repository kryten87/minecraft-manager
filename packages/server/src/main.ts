import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { LogLevel } from '@nestjs/common';

async function bootstrap() {
  let logger = `${process.env.LOG_LEVELS || ''}`.split(',').filter(Boolean);
  if (logger.length === 0) {
    logger = ['error', 'warn'];
  }
  const app = await NestFactory.create(AppModule, {
    logger: logger as LogLevel[],
  });
  const config = app.get<ConfigService>(ConfigService);
  const port = config.get<number>('PORT') || 3000;

  console.log(`[bootstrap] Application listening on port ${port}`);
  await app.listen(port);
}
bootstrap();
