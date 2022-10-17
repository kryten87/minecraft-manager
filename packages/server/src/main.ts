import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  let logger = `${process.env.LOG_LEVELS || ''}`.split(',').filter(Boolean);
  if (logger.length === 0) {
    logger = ['error', 'warn'];
  }
  const app = await NestFactory.create(AppModule, {
    logger,
  });
  const config = app.get<ConfigService>(ConfigService);
  const port = config.get<number>('PORT') || 3000;
  await app.listen(port);
}
bootstrap();
